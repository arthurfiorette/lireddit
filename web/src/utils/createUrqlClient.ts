import { cacheExchange } from '@urql/exchange-graphcache';
import Router from 'next/router';
import { dedupExchange, Exchange, fetchExchange } from 'urql';
import { pipe, tap } from 'wonka';
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../generated/graphql';
import { postsPerPage } from '../pages';
import { betterUpdateQuery } from './betterUpdateQuery';

const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error) {
          if (error.message == '[GraphQL] Not authenticated') {
            Router.push('/login');
          }
        }
      })
    );
  };

export function createUrqlClient(ssrExchange: Exchange) {
  return {
    url: 'http://localhost:1227/graphql',
    fetchOptions: { credentials: 'include' as const },
    exchanges: [
      dedupExchange,
      cacheExchange({
        updates: {
          Mutation: {
            // Update the MeQuery cache to return the logged on user.
            logout: (result, _args, cache, _info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                () => ({ me: null })
              );
            },
            // Update the MeQuery cache to return the logged on user.
            login: (result, _args, cache, _info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                (res, query) =>
                  res.login.errors ? query : { me: res.login.user }
              );
            },
            // Update the MeQuery cache to return the new registered user for automatic login when registering.
            register: (result, _args, cache, _info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                (res, query) =>
                  res.register.errors ? query : { me: res.register.user }
              );
            },
            createPost: (_result, _args, cache, _info) => {
              // There is no need to invalidate the entire cache, because when
              // creating a post, the first X posts is invalidated, and when
              // requesting new posts, the cursor changes to the last but one
              // of the list, then becomes a request never made yet. But if we
              // added more X - 1 posts, this request is cached back to the
              // second page from the beginning.
              cache.invalidate('Query', 'posts', {
                limit: postsPerPage,
              });
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
}
