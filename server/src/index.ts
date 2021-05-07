// TypeORM and TypeGraphql need this at the top
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './constants';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Updoot } from './entities/Updoot';

(async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'lireddit',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    migrations: [path.join(__dirname, './migrations/*')],
    synchronize: true,
    entities: [Post, User, Updoot],
  });

  await conn.runMigrations();

  const app = express();
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  // Enable CORS
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

  // Uses express-session to manage cookies
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
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
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apollo.applyMiddleware({ app, cors: false });

  const server = app.listen(1227, () => console.log('Server started'));

  process.on('SIGTERM', () => {
    server.close(async () => {
      await conn.close();
    });
  });
})().catch(console.error);
