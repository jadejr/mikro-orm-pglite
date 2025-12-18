import { BasePostgreSqlPlatform } from '@mikro-orm/sql';


export class PgLitePlatform extends BasePostgreSqlPlatform {
  /** @inheritDoc */
  override supportsMultipleStatements(): boolean {
    return false;
  }

  /** @inheritDoc */
  override getDefaultClientUrl(): string {
    return 'pglite://';
  }
}
