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
}
