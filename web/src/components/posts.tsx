import {
  Box,
  Heading,
  Stack,
  Text,
  Flex,
  Button,
  Spinner,
  HStack,
} from '@chakra-ui/react';
import React from 'react';
import { PostsQuery } from '../generated/graphql';

export const PostPreview = (({ post }) => {
  return (
    <Box key={post.id} p={5} shadow="md" borderWidth="1px">
      <Heading fontSize="xl">{post.title}</Heading>
      <Text mt={4}>{post.textPreview}</Text>
    </Box>
  );
}) as React.FC<{ post: PostsQuery['posts'][0] }>;

export const PostPreviewGroup = (({ fetching, data }) => {
  return (
    <>
      {!data ? (
        fetching ? (
          <HStack mt={5}>
            <Spinner size="md" color="teal" />
            <Text color="teal">Loading...</Text>
          </HStack>
        ) : (
          <HStack mt={5}>
            <Spinner size="md" speed="3s" color="red.500" />
            <Text color="red.500">Couldn't load any post.</Text>
          </HStack>
        )
      ) : (
        <>
          <Stack spacing={6}>
            {data.posts.map((p) => (
              <PostPreview post={p} />
            ))}
          </Stack>
          <Flex>
            <Button isLoading={fetching} color="teal" m="auto" my={8}>
              Load More
            </Button>
          </Flex>
        </>
      )}
    </>
  );
}) as React.FC<{ data: PostsQuery | undefined; fetching: boolean }>;
