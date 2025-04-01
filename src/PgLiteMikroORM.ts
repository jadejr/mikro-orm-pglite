import {
  defineConfig,
  MikroORM,
  type Options,
  type IDatabaseDriver,
  type EntityManager,
  type EntityManagerType,
} from '@mikro-orm/core';
import type { SqlEntityManager } from '@mikro-orm/knex';

import { PgLiteDriver } from './PgLiteDriver.js';

/**
 * @inheritDoc
 */
export class PgLiteMikroORM<EM extends EntityManager = SqlEntityManager> extends MikroORM<PgLiteDriver, EM> {
  private static DRIVER = PgLiteDriver;

  /**
   * @inheritDoc
   */
  static override async init<
    D extends IDatabaseDriver = PgLiteDriver,
    EM extends EntityManager = D[typeof EntityManagerType] & EntityManager,
  >(options?: Options<D, EM>): Promise<MikroORM<D, EM>> {
    return super.init(options);
  }

  /**
   * @inheritDoc
   */
  static override initSync<
    D extends IDatabaseDriver = PgLiteDriver,
    EM extends EntityManager = D[typeof EntityManagerType] & EntityManager,
  >(options: Options<D, EM>): MikroORM<D, EM> {
    return super.initSync(options);
  }
}

export type PgLiteOptions = Options<PgLiteDriver>;

/* v8 ignore next 3 */
export function definePgLiteConfig(options: PgLiteOptions) {
  return defineConfig({ driver: PgLiteDriver, ...options });
}
