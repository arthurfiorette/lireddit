import argon2 from 'argon2';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getConnection } from 'typeorm';
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
    @Ctx() { redis, req }: ResolverContext
  ): Promise<UserResponse> {
    if (newPassword.length < 4) {
      return error('newPassword', 'length must be greater than 4 characters');
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return error('token', 'token expired, get a new one');
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return error('token', 'user no longer exists');
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key);

    // login user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Ctx() { redis }: ResolverContext,
    @Arg('email') email: string
  ) {
    const user = await User.findOne({ where: { email } });

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
  async me(@Ctx() { req, res }: ResolverContext): Promise<User | undefined> {
    const id = req.session.userId;

    // you are not logged in
    if (!id) return;

    const user = await User.findOne(id);

    // Clear the cookie if there is no user related to it
    if (!user) res.clearCookie(COOKIE_NAME);

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') { username, password, email }: UsernamePasswordInput,
    @Ctx() { req }: ResolverContext
  ): Promise<UserResponse> {
    const errors = validateRegisterInput({ username, password, email });

    if (!!errors.length) return { errors };

    const hashedPassword = await argon2.hash(password);

    let user;

    // The error didn't ocurred to me at 3:10:10
    // But i implemented the 5:39:39 query builder anyway :)

    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({ username, email, password: hashedPassword })
        .returning('*')
        .execute();
      user = result.raw[0];
    } catch (err) {
      // Duplicate constraint error code
      if (err.code === '23505') {
        switch (err.constraint) {
          case 'UQ_e12875dfb3b1d92d7d7c5377e22': // Unique email constraint
            return error(
              'email',
              'this email is already associated with another account'
            );

          case 'UQ_78a916df40e02a9deb1c4b75edb': // Unique username constraint
            return error('username', 'username already taken');
        }
      }

      // Should never get here.
      console.log('error:', { ...err });
      return error('username', `Unknown error: ${err.code}`);
    }

    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: ResolverContext
  ): Promise<UserResponse> {
    const usernameOrEmailKey = EMAIL_REGEX.test(usernameOrEmail)
      ? 'email'
      : 'username';

    const user = await User.findOne({
      where: { [usernameOrEmailKey]: usernameOrEmail },
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
