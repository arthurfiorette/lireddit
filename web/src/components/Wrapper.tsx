import { Box } from '@chakra-ui/react';
import React from 'react';

export const Wrapper = (({ children, variant = 'regular' }) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === 'regular' ? '800px' : '400px'}
      w="100%"
    >
      {children}
    </Box>
  );
}) as React.FC<{
  variant?: 'small' | 'regular';
}>;
