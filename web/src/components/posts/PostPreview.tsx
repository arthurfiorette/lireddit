import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { PostsQuery } from '../../generated/graphql';

export const PostPreview = (({ post }) => {
  return (
    <Box key={post.id} p={5} shadow="md" borderWidth="1px">
      <Flex>
        <Heading fontSize="xl">{post.title}</Heading>
        <Text ml="auto" color="gray.500" fontSize="xs">
          {new Date(parseInt(post.createdAt)).toLocaleString()}
        </Text>
      </Flex>
      <Text mt={4}>{post.textPreview}</Text>
    </Box>
  );
}) as React.FC<{ post: PostsQuery['posts']['posts'][0] }>;
