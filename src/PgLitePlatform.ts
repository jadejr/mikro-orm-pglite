import { type MikroORM } from '@mikro-orm/core';
import { PostgreSqlPlatform, PostgreSqlSchemaHelper } from '@mikro-orm/postgresql';

import { PgLiteExceptionConverter } from './PgLiteExceptionConverter.js';
import { PgLiteSchemaGenerator } from './PgLiteSchemaGenerator.js';

export class PgLitePlatform extends PostgreSqlPlatform {
  protected override readonly schemaHelper: PostgreSqlSchemaHelper = new PostgreSqlSchemaHelper(this);
  protected override readonly exceptionConverter = new PgLiteExceptionConverter();

  override lookupExtensions(orm: MikroORM): void {
    PgLiteSchemaGenerator.register(orm);
  }

  override supportsMultipleStatements(): boolean {
    return false;
  }

  override getDefaultClientUrl(): string {
    return 'pglite://';
  }
}
