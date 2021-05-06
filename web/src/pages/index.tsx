import { Flex, Heading, Link } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import React from 'react';
import { Layout } from '../components/Layout';
import { PostPreviewGroup } from '../components/posts';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = (({}) => {
  const [{ data, fetching }] = usePostsQuery({ variables: { limit: 10 } });

  return (
    <Layout variant="regular">
      <Flex align="center" mb={6}>
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create post</Link>
        </NextLink>
      </Flex>
      <PostPreviewGroup data={data} fetching={fetching} />
    </Layout>
  );
}) as React.FC<{}>;

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
