import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import redis from 'redis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './constants';
import mikroConfig from './mikro-orm.config';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

(async () => {
  const orm = await MikroORM.init(mikroConfig);
  // Run migrations before anything else
  await orm.getMigrator().up();

  const app = express();
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  // Enable CORS
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

  // Uses express-session to manage cookies
  app.use(
    session({
      name: COOKIE_NAME,
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

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  apollo.applyMiddleware({ app, cors: false });

  const server = app.listen(1227, () => console.log('Server started'));

  process.on('SIGTERM', () => {
    server.close(async () => {
      await orm.close();
    });
  });
})().catch(console.error);
