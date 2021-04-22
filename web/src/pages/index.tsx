import { withUrqlClient } from 'next-urql';
import React from 'react';
import { NavBar } from '../components/NavBar';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';

const Index = (({}) => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <NavBar />
      <div>Hello world!</div>
      <br />
      <hr />
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </>
  );
}) as React.FC<{}>;

export default withUrqlClient(createUrqlClient,{ssr:true})(Index);
