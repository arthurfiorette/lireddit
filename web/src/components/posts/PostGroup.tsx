import { Button, Flex, Stack, StackDivider } from '@chakra-ui/react';
import React from 'react';
import { PostsQueryVariables, usePostsQuery } from '../../generated/graphql';
import { PostPreview } from './PostPreview';

export const PostGroup = (({ variables, isLastPage, onLoadMore }) => {
  const [{ data, fetching }] = usePostsQuery({ variables });

  return (
    <>
      <Stack
        spacing={8}
        mt={isLastPage ? 8 : 0}
        divider={<StackDivider borderColor="gray.200" />}
      >
        {data?.posts.posts.map((p) =>
          !p ? null : <PostPreview key={p.id} post={p} />
        )}
      </Stack>
      {(isLastPage && fetching) || (isLastPage && data?.posts.hasMore) ? (
        <Flex>
          <Button
            onClick={() =>
              data?.posts &&
              onLoadMore(
                data.posts.posts[data.posts.posts.length - 1].createdAt
              )
            }
            isLoading={fetching}
            m="auto"
            my={8}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </>
  );
}) as React.FC<{
  variables: PostsQueryVariables;
  isLastPage: boolean;
  onLoadMore: (cursor: string) => void;
}>;
