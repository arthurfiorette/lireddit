import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/Hello';
import { PostResolver } from './resolvers/Post';

(async () => {
  const orm = await MikroORM.init(mikroConfig);
  // Run migrations before anything else
  orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(1227, () => console.log('Server started'));

  // const post = orm.em.create(Post, { title: 'Asd' });
  // await orm.em.persistAndFlush(post);

  // const posts = await orm.em.find(Post, {})

  // console.log(posts)
})().catch(console.error);
