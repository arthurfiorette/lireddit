import { Flex, Heading, Link } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { PostPreviewGroup } from '../components/posts';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = (({}) => {
  const [variables, setVariables] = useState({
    cursor: null as string | null,
    limit: 10,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });

  return (
    <Layout variant="regular">
      <Flex align="center" mb={6}>
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create post</Link>
        </NextLink>
      </Flex>
      <PostPreviewGroup
        data={data}
        fetching={fetching}
        onLoadMore={() =>
          setVariables({
            limit: variables.limit,
            cursor: data!.posts[data!.posts.length - 1].createdAt,
          })
        }
      />
    </Layout>
  );
}) as React.FC<{}>;

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
