import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { HelloResolver } from './resolvers/Hello';
import { PostResolver } from './resolvers/Post';
import { UserResolver } from './resolvers/User';
import { __prod__ } from './constants';

(async () => {
  const orm = await MikroORM.init(mikroConfig);
  // Run migrations before anything else
  orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
        disableTTL: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 Years
        httpOnly: true,
        sameSite: 'lax', // related to csrf
        secure: __prod__, // Cookie only works in https
      },
      saveUninitialized: false,
      secret: 'l123sasda131kdfjRANDOMa123adj123haSECRET3f',
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(1227, () => console.log('Server started'));
})().catch(console.error);
