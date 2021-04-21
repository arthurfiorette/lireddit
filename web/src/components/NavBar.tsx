import React from 'react';

import { Box, Button, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useMeQuery } from '../generated/graphql';

export const NavBar = (({}) => {
  const [{ data, fetching }] = useMeQuery();

  let body;

  // data is loading
  if (fetching) {
    body = null;
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={4}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
    // user logged in
  } else {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button variant="link">logout</Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4}>
      <Box ml="auto">{body}</Box>
    </Flex>
  );
}) as React.FC<{}>;
