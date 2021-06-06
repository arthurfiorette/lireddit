import Router from 'next/router';
import { Exchange } from 'urql';
import { pipe, tap } from 'wonka';

export const errorExchange: Exchange = ({ forward }) => (ops$) => {
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
