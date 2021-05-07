import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { PostsQuery } from '../../generated/graphql';
import { timeAgo } from '../../utils/time';

export const PostPreview = (({ post }) => {
  return (
    <Box key={post.id} p={5} shadow="md" borderWidth="1px">
      <Flex>
        <Heading fontSize="xl" maxWidth={'80%'}>
          {post.title}
        </Heading>
        <Text ml="auto" color="gray.500" fontSize="xs">
          {timeAgo.format(new Date(parseInt(post.createdAt)))}
        </Text>
      </Flex>
      <Text color="gray.600">posted by {post.creator.username}</Text>
      <Text mt={4}>{post.textPreview}</Text>
    </Box>
  );
}) as React.FC<{ post: PostsQuery['posts']['posts'][0] }>;
