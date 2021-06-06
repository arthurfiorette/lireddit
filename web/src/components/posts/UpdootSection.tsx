import React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { IconButton, Text, VStack } from '@chakra-ui/react';
import { PostSnippetFragment, useVoteMutation } from 'src/generated/graphql';

export const UpdootSection = (({ post }) => {
  const [{ fetching }, vote] = useVoteMutation();

  return (
    <VStack height="100%" mr={4}>
      <IconButton
        aria-label="Up vote"
        icon={<ChevronUpIcon />}
        boxSize="24px"
        isLoading={fetching}
        onClick={() => {
          vote({
            postId: post.id,
            value: 1,
          });
        }}
      />
      <Text>{post.votes}</Text>
      <IconButton
        aria-label="Down vote"
        icon={<ChevronDownIcon />}
        boxSize="24px"
        isLoading={fetching}
        onClick={() => {
          vote({
            postId: post.id,
            value: -1,
          });
        }}
      />
    </VStack>
  );
}) as React.FC<{ post: PostSnippetFragment }>;
