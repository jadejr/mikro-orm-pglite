import { type MikroORM } from '@mikro-orm/core';
import { BasePostgreSqlPlatform, PostgreSqlSchemaHelper } from '@mikro-orm/sql';

import { type PgLiteDriver } from './PgLiteDriver.js';
import { PgLiteExceptionConverter } from './PgLiteExceptionConverter.js';
import { PgLiteSchemaGenerator } from './PgLiteSchemaGenerator.js';

export class PgLitePlatform extends BasePostgreSqlPlatform {
  protected override readonly schemaHelper: PostgreSqlSchemaHelper = new PostgreSqlSchemaHelper(this);
  protected override readonly exceptionConverter = new PgLiteExceptionConverter();

  /** @inheritDoc */
  override lookupExtensions(orm: MikroORM<PgLiteDriver>): void {
    PgLiteSchemaGenerator.register(orm);
  }

  /** @inheritDoc */
  override supportsMultipleStatements(): boolean {
    return false;
  }

  /** @inheritDoc */
  override getDefaultClientUrl(): string {
    return 'pglite://';
  }
}
