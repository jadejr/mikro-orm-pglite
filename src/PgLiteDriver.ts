import { type Configuration, type Constructor } from '@mikro-orm/core';
import { AbstractSqlDriver } from '@mikro-orm/sql';

import { PgLiteConnection } from './PgLiteConnection.js';
import { PgLiteMikroORM } from './PgLiteMikroORM.js';
import { PgLitePlatform } from './PgLitePlatform.js';

export class PgLiteDriver extends AbstractSqlDriver<PgLiteConnection> {
  constructor(config: Configuration) {
    super(config, new PgLitePlatform(), PgLiteConnection, ['kysely', '@electric-sql/pglite']);
  }

  /** @inheritDoc */
  override getORMClass(): Constructor<PgLiteMikroORM> {
    return PgLiteMikroORM;
  }

  /*
   @todo adopt at least the logger, but maybe other query types

    async execute<T extends QueryResult | EntityData<AnyEntity> | EntityData<AnyEntity>[] = EntityData<AnyEntity>[]>(query: string | NativeQueryBuilder | RawQueryFragment, params: any[] = [], method: 'all' | 'get' | 'run' = 'all', ctx?: Transaction, loggerContext?: LoggingOptions): Promise<T> {
      return this.rethrow(this.connection.execute(query, params, method, ctx, loggerContext));
    }
  */
  async loadQuery(query: string): Promise<void> {
    return this.rethrow(this.connection.loadQuery(query));
    // return this.rethrow(this.connection.execute(query, params, method, ctx, loggerContext));
  }
}
