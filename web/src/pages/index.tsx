import { Flex, Heading, Link } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { PostGroup } from '../components/posts';
import { createUrqlClient } from '../utils/createUrqlClient';

const postsPerPage = 10;

const Index = (({}) => {
  const [pageVariables, setPageVariables] = useState([
    { cursor: null as string | null, limit: postsPerPage },
  ]);

  return (
    <Layout variant="regular">
      <Flex align="center" mb={6}>
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create post</Link>
        </NextLink>
      </Flex>

      {pageVariables.map((variables, index) => (
        <PostGroup
          key={variables.cursor + ''}
          variables={variables}
          isLastPage={pageVariables.length - 1 === index}
          onLoadMore={(cursor) =>
            setPageVariables([
              ...pageVariables,
              { cursor, limit: postsPerPage },
            ])
          }
        />
      ))}
    </Layout>
  );
}) as React.FC<{}>;

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
