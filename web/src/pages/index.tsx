import React from 'react';
import { NavBar } from '../components/NavBar';

export const Index = (({}) => {
  return (
    <>
      <NavBar />
      <div>Hello world!</div>
    </>
  );
}) as React.FC<{}>;

export default Index;
