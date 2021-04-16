import { Connection, IDatabaseDriver, Options } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';

export default {
  entities: [Post, User],
  dbName: 'lireddit',
  type: 'postgresql',
  debug: !__prod__,
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
} as Options<IDatabaseDriver<Connection>>; // Same as Parameters<typeof MikroORM.init>[0];
