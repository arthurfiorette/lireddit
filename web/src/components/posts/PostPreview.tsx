import { Box, chakra, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { PostsQuery } from 'src/generated/graphql';
import { timeAgo } from 'src/utils/time';
import { UpdootSection } from './UpdootSection';

export const PostPreview = (({ post }) => {
  return (
    <Stack direction="row" key={post.id} p={5} shadow="md" borderWidth="1px">
      <UpdootSection post={post} />
      <Box w="100%">
        <Flex direction="row">
          <Heading fontSize="xl" maxWidth={'80%'}>
            {post.title}
          </Heading>
          <Text ml="auto" color="gray.500" fontSize="xs">
            {timeAgo.format(new Date(parseInt(post.createdAt)))}
          </Text>
        </Flex>
        <Text color="gray.400" fontSize="xs">
          posted by
          <chakra.span color="gray.800">
            {' ' + post.creator.username}
          </chakra.span>
        </Text>
        <Text mt={4} paddingY="1" paddingX="3" minHeight="2em" color="gray.600">
          {post.textPreview}
        </Text>
      </Box>
    </Stack>
  );
}) as React.FC<{ post: PostsQuery['posts']['posts'][0] }>;
