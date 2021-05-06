import { MiddlewareFn } from 'type-graphql';
import { ResolverContext } from '../types';

export const isAuth: MiddlewareFn<ResolverContext> = async (
  { context },
  next
) => {
  if (!context.req.session.userId) {
    throw new Error('Not authenticated');
  }

  return next();
};
