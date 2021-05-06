import { Box, Button, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

export const NavBar = (({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data }] = useMeQuery({
    pause: isServer(),
  });

  let body = (
    <>
      <NextLink href="/login">
        <Link mr={4}>Login</Link>
      </NextLink>
      <NextLink href="/register">
        <Link>Register</Link>
      </NextLink>
    </>
  );

  if (data?.me) {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={() => logout()}
          isLoading={logoutFetching}
          color="#FCFAF5"
          _hover={{ color: '#251c19' }}
          variant="link"
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex
      zIndex={1}
      position="sticky"
      top={0}
      bg="teal"
      color="#FCFAF5"
      fontSize="1.1em"
      p={4}
      boxShadow="0px 1px 3px #474F60"
    >
      <Box>
        <NextLink href="/">
          <Link
            mr={4}
            fontFamily="sans-serif"
            style={{ textDecoration: 'none' }}
            _hover={{ color: '#251c19' }}
          >
            Lireddit
          </Link>
        </NextLink>
      </Box>
      <Box ml="auto">{body}</Box>
    </Flex>
  );
}) as React.FC<{}>;
