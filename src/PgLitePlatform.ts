import { type MikroORM } from '@mikro-orm/core';
import { PostgreSqlPlatform } from '@mikro-orm/postgresql';
import { PgLiteSchemaHelper } from './PgLiteSchemaHelper.js';
import { PgLiteSchemaGenerator } from './PgLiteSchemaGenerator.js';
import { PgLiteExceptionConverter } from './PgLiteExceptionConverter.js';

export class PgLitePlatform extends PostgreSqlPlatform {
  protected override readonly schemaHelper: PgLiteSchemaHelper = new PgLiteSchemaHelper(this);
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
