export * from '@mikro-orm/sql';
export * from './PgLiteConnection.js';
export * from './PgLiteDriver.js';
export * from './PgLitePlatform.js';
export {
  PgLiteMikroORM as MikroORM,
  PgLiteOptions as Options,
  definePgLiteConfig as defineConfig,
} from './PgLiteMikroORM.js';

// compatibility exports
export { PgLiteDriver as PostgreSqlDriver } from './PgLiteDriver.js';
export { PgLiteConnection as PostgreSqlConnection } from './PgLiteConnection.js';
export { PgLitePlatform as PostgreSqlPlatform } from './PgLitePlatform.js';

