import { dedupExchange, Exchange, fetchExchange } from 'urql';
import { cacheExchange } from './cache-exchanges';
import { errorExchange } from './error-exchange';

export function createUrqlClient(ssrExchange: Exchange) {
  return {
    url: 'http://localhost:1227/graphql',
    fetchOptions: { credentials: 'include' as const },
    exchanges: [
      dedupExchange,
      cacheExchange,
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
}
