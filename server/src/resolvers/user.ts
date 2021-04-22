import argon2 from 'argon2';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { COOKIE_NAME } from '../constants';
import { User } from '../entities/User';
import { ResolverContext } from '../types';
import { validateRegisterInput, EMAIL_REGEX } from '../utils/validation';
import { UsernamePasswordInput, UserResponse } from './types';

const error = (field: string, message: string) => ({
  errors: [{ field: field, message: message }],
});

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword() {
    // @Ctx() {em, req}: ResolverContext, // @Arg('email') email: string,
    // const user = await em.findOne(User, {email})
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
      // throw { ...new Error('asd'), a: 2, b: 5 };
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
            error('username', 'username already taken');
        }
      } else {
        console.log('erro:', { ...err });
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
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "username doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
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
