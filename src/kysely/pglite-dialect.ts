import fs from 'node:fs';

import {
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  type DatabaseIntrospector,
  type Dialect,
  type DialectAdapter,
  type Driver,
  type Kysely,
  type QueryCompiler,
} from 'kysely';
import { PGliteDialectConfig } from './pglite-dialect-config.js';
import { PGliteDriver } from './pglite-driver.js';

/**
 *
 * PGlite dialect that uses the [@electric-sql/pglite](https://pglite.dev) library.
 *
 * The constructor takes an instance of {@link PGliteDialectConfig}.
 *
 * ```ts
 * import { PGlite } from '@electric-sql/pglite'
 * import { PGliteDialect } from 'kysely-pglite'
 *
 * new PGliteDialect({
 *   PGlite: new PGlite({
 *     'dataDir': '/path/to/dataDir',
 *    // other options
 *   })
 * })
 * ```
 *
 * If you want PGlite to only be created once it's first used, `PGlite`
 * can be a function:
 *
 * The constructor takes an instance of {@link PGliteDialectConfig}.
 *
 * ```ts
 * import { PGlite } from '@electric-sql/pglite'
 * import { PGliteDialect } from 'kysely-pglite'
 *
 * new PGliteDialect({
 *   PGlite: async () => PGlite.create({
 *     'dataDir: '/path/to/dataDir',
 *    // other options
 *   })
 * })
 * ```
 *
 * You can also let the dialect create the PGlite instance for you while using PGlite's options
 *
 * ```ts
 * new PGliteDialect({
 *   PGliteOptions: {
 *     'dataDir: '/path/to/dataDir',
 *    // other options
 *   }
 * })
 * ```
 */
export class PGliteDialect implements Dialect {
  readonly #config: PGliteDialectConfig;

  constructor(config: PGliteDialectConfig) {
    this.#config = config;

    const options = config.PGliteOptions;
    if (options?.dataDir && typeof options.dataDir === 'string') {
      fs.mkdirSync(options.dataDir, { recursive: true });
    }
  }

  createDriver(): Driver {
    return new PGliteDriver(this.#config);
  }

  createQueryCompiler(): QueryCompiler {
    return new PostgresQueryCompiler();
  }

  createAdapter(): DialectAdapter {
    return new PostgresAdapter();
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new PostgresIntrospector(db);
  }
}
