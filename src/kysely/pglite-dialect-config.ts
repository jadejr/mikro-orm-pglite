import { type PGlite, type PGliteOptions } from '@electric-sql/pglite';
import { type DatabaseConnection } from 'kysely';

type PGliteOrPromise = PGlite | ((options?: PGliteOptions) => Promise<PGlite>);

export interface PGliteDialectConfig {
  /**
   * The options to pass to the PGlite instance.
   */
  PGliteOptions?: PGliteOptions;
  /**
   * A PGlite instance or a function that returns one.
   *
   * If a function is provided, it's called once when the first query is executed.
   */
  PGlite?: PGliteOrPromise;
  /**
   * Called once for each created connection.
   */
  onCreateConnection?: (connection: DatabaseConnection) => Promise<void>;
  /**
   * Called every time a connection is acquired from the pool.
   */
  onReserveConnection?: (connection: DatabaseConnection) => Promise<void>;
}
