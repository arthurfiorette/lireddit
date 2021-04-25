import argon2 from 'argon2';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { v4 as uuid } from 'uuid';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { User } from '../entities/User';
import { ResolverContext } from '../types';
import { sendEmail } from '../utils/sendEmail';
import { EMAIL_REGEX, validateRegisterInput } from '../utils/validation';
import { UsernamePasswordInput, UserResponse } from './types';

const error = (field: string, message: string): UserResponse => ({
  errors: [{ field: field, message: message }],
});

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { em, redis, req }: ResolverContext
  ): Promise<UserResponse> {
    if (newPassword.length < 4) {
      return error('newPassword', 'length must be greater than 4 characters');
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return error('token', 'token expired, get a new one');
    }

    const user = await em.findOne(User, { id: parseInt(userId) });

    if (!user) {
      return error('token', 'user no longer exists');
    }

    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);

    await redis.del(key);

    // login user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Ctx() { em, redis }: ResolverContext,
    @Arg('email') email: string
  ) {
    const user = await em.findOne(User, { email });

    if (!user) {
      // the email is not in the db
      return true;
    }

    // Prevent the delay if the user exists
    // https://youtu.be/I6ypD7qv3Z8?t=19278
    (async () => {
      const token = uuid();

      await redis.set(
        FORGET_PASSWORD_PREFIX + token,
        user.id,
        'ex',
        1000 * 60 * 60 * 24 * 3 // 3 Days
      );

      await sendEmail(
        email,
        `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
      );
    })();

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, res, em }: ResolverContext): Promise<User | null> {
    const id = req.session.userId;

    // you are not logged in
    if (!id) {
      return null;
    }

    const user = await em.findOne(User, { id });

    if (!user) {
      // Clear the cookie if there is no user related to it
      res.clearCookie(COOKIE_NAME);
    }

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') { username, password, email }: UsernamePasswordInput,
    @Ctx() { em, req }: ResolverContext
  ): Promise<UserResponse> {
    const errors = validateRegisterInput({ username, password, email });
    if (errors.length > 0) return { errors };

    const hashedPassword = await argon2.hash(password);

    const user = em.create(User, { username, email, password: hashedPassword });

    try {
      // The error didn't ocurred to me at 3:10:10
      await em.persistAndFlush(user);
    } catch (err) {
      // duplicate constraint error code
      if (err.code === '23505') {
        switch (err.constraint) {
          case 'user_email_unique':
            return error(
              'email',
              'this email is already associated with another account'
            );

          case 'user_username_unique':
            return error('username', 'username already taken');
        }
      } else {
        // Should never get here.
        console.log('error:', { ...err });
        return error('username', `Unknown error: ${err.code}`);
      }
    }

    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: ResolverContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      [EMAIL_REGEX.test(usernameOrEmail)
        ? 'email'
        : 'username']: usernameOrEmail,
    });

    if (!user) {
      return error('usernameOrEmail', "username doesn't exist");
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return error('password', 'incorrect password');
    }

    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: ResolverContext): Promise<boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        resolve(!err);
      })
    );
  }
}
