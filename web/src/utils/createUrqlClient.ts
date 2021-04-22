import { cacheExchange } from '@urql/exchange-graphcache';
import { dedupExchange, fetchExchange } from 'urql';
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';

export function createUrqlClient(ssrExchange: any, _ctx: any) {
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
          },
        },
      }),
      ssrExchange,
      fetchExchange,
    ],
  };
}
