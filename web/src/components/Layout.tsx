import React from 'react';
import { NavBar } from './NavBar';
import { Wrapper, WrapperVariant } from './Wrapper';

export const Layout = (({ children, variant }) => {
  return (
    <>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
}) as React.FC<{
  variant: WrapperVariant;
}>;
