import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core'

export type ResolverContext = {
  em: EntityManager<IDatabaseDriver<Connection>>
}