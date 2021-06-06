import {
  Cache,
  cacheExchange as CacheExchange,
  QueryInput,
} from '@urql/exchange-graphcache';
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutation,
  VoteMutationVariables,
} from '@/generated/graphql';
import { postsPerPage } from '@/pages';
import { gql } from '@urql/core';

const betterUpdateQuery = <Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) => cache.updateQuery(qi, (data) => fn(result, data as any) as any);

export const cacheExchange = CacheExchange({
  keys: {
    // Paginated posts, the result of posts query, doesn't have
    // any key, as its {hasMore: boolean, posts: Post[]}, so
    // graphql generate a warning about that.
    // Here i explicitly set his key to null
    PaginatedPosts: () => null,
  },
  updates: {
    Mutation: {
      vote: (result, args, cache, _info) => {
        const { postId } = args as VoteMutationVariables;

        const data = cache.readFragment(
          gql`
            fragment _ on Post {
              id
              votes
            }
          `,
          { id: postId }
        );

        const { successful, computed } = result.vote as VoteMutation['vote'];

        // There's cache for the value and the vote was computed
        if (data && successful) {
          console.log(1);
          cache.writeFragment(
            gql`
              fragment _ on Post {
                id
                votes
              }
            `,
            { id: postId, votes: data.votes + computed }
          );
        }
      },

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
          (res, query) => (res.login.errors ? query : { me: res.login.user })
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
});
