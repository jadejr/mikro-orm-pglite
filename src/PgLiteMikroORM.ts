import {
  defineConfig,
  MikroORM,
  type AnyEntity,
  type EntityClass,
  type EntityManager,
  type EntityManagerType,
  type EntitySchema,
  type IDatabaseDriver,
  type Options,
} from '@mikro-orm/core';
import { type SqlEntityManager } from '@mikro-orm/sql';

import { PgLiteDriver } from './PgLiteDriver.js';

export type PgLiteOptions<
  EM extends SqlEntityManager<PgLiteDriver> = SqlEntityManager<PgLiteDriver>,
  Entities extends (string | EntityClass<AnyEntity> | EntitySchema)[] = (
    | string
    | EntityClass<AnyEntity>
    | EntitySchema
  )[],
> = Options<PgLiteDriver, EM, Entities>;

export function definePgLiteConfig<
  EM extends SqlEntityManager<PgLiteDriver> = SqlEntityManager<PgLiteDriver>,
  Entities extends (string | EntityClass<AnyEntity> | EntitySchema)[] = (
    | string
    | EntityClass<AnyEntity>
    | EntitySchema
  )[],
>(options: Options<PgLiteDriver, EM, Entities>) {
  return defineConfig({ driver: PgLiteDriver, ...options });
}

/**
 * @inheritDoc
 */
export class PgLiteMikroORM<
  EM extends SqlEntityManager<PgLiteDriver> = SqlEntityManager<PgLiteDriver>,
  Entities extends (string | EntityClass<AnyEntity> | EntitySchema)[] = (
    | string
    | EntityClass<AnyEntity>
    | EntitySchema
  )[],
> extends MikroORM<PgLiteDriver, EM, Entities> {
  /**
   * @inheritDoc
   */
  static override async init<
    D extends IDatabaseDriver = PgLiteDriver,
    EM extends EntityManager<D> = D[typeof EntityManagerType] & EntityManager<D>,
    Entities extends (string | EntityClass<AnyEntity> | EntitySchema)[] = (
      | string
      | EntityClass<AnyEntity>
      | EntitySchema
    )[],
  >(options: Options<D, EM, Entities>): Promise<MikroORM<D, EM, Entities>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return super.init(definePgLiteConfig(options as any) as any);
  }

  /**
   * @inheritDoc
   */
  constructor(options: Options<PgLiteDriver, EM, Entities>) {
    super(definePgLiteConfig(options));
  }
}