import { PGlite } from '@electric-sql/pglite';
import {
  CompiledQuery,
  type DatabaseConnection,
  type QueryCompiler,
  type QueryResult,
  type TransactionSettings,
  createQueryId,
} from 'kysely';

import { PGliteDialectConfig } from './pglite-dialect-config.js';
import { parseSavepointCommand } from './parser/savepoint-parser.js';

export class PGliteDriver {
  readonly #config: PGliteDialectConfig;
  #client!: PGlite;

  constructor(config: PGliteDialectConfig) {
    this.#config = config;
  }

  async init(): Promise<void> {
    if (this.#config.PGlite instanceof PGlite) {
      this.#client = this.#config.PGlite;
      return;
    }
    if (typeof this.#config.PGlite === 'function') {
      this.#client = await this.#config.PGlite(this.#config.PGliteOptions);
      return;
    }
    this.#client = new PGlite(this.#config.PGliteOptions);
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    if (!this.#client) {
      throw new Error('PGlite client is not initialized. init() must be called first.');
    }
    const connection = new PGliteConnection(this.#client);

    if (this.#config.onCreateConnection) {
      await this.#config.onCreateConnection(connection);
    }
    if (this.#config.onReserveConnection) {
      await this.#config.onReserveConnection(connection);
    }

    return connection;
  }

  async beginTransaction(connection: DatabaseConnection, settings: TransactionSettings): Promise<void> {
    if (settings.isolationLevel || settings.accessMode) {
      let sql = 'START TRANSACTION';

      if (settings.isolationLevel) {
        sql += ` ISOLATION LEVEL ${settings.isolationLevel}`;
      }

      if (settings.accessMode) {
        sql += ` ${settings.accessMode}`;
      }

      await connection.executeQuery(CompiledQuery.raw(sql));
    } else {
      await connection.executeQuery(CompiledQuery.raw('BEGIN'));
    }
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('COMMIT'));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('ROLLBACK'));
  }

  async savepoint(
    connection: DatabaseConnection,
    savepointName: string,
    compileQuery: QueryCompiler['compileQuery'],
  ): Promise<void> {
    await connection.executeQuery(compileQuery(parseSavepointCommand('savepoint', savepointName), createQueryId()));
  }

  async rollbackToSavepoint(
    connection: DatabaseConnection,
    savepointName: string,
    compileQuery: QueryCompiler['compileQuery'],
  ): Promise<void> {
    await connection.executeQuery(compileQuery(parseSavepointCommand('rollback to', savepointName), createQueryId()));
  }

  async releaseSavepoint(
    connection: DatabaseConnection,
    savepointName: string,
    compileQuery: QueryCompiler['compileQuery'],
  ): Promise<void> {
    await connection.executeQuery(compileQuery(parseSavepointCommand('release', savepointName), createQueryId()));
  }

  async destroy(): Promise<void> {
    await this.#client.close();
  }

  async releaseConnection(_connection: DatabaseConnection): Promise<void> {}
}

export class PGliteConnection implements DatabaseConnection {
  #client: PGlite;

  constructor(client: PGlite) {
    this.#client = client;
  }

  async executeQuery<R>(compiledQuery: CompiledQuery<any>): Promise<QueryResult<R>> {
    const res = await this.#client.query<R>(compiledQuery.sql, [...compiledQuery.parameters]);
    const numAffectedRows = res.affectedRows ? BigInt(res.affectedRows) : undefined;
    // Remove affectedRows from the result, since it's not part of the standard QueryResult
    delete res.affectedRows;

    return {
      ...res,
      numAffectedRows,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await, require-yield
  async *streamQuery(): AsyncGenerator<never, void, unknown> {
    throw new Error('PGlite does not support streaming.');
  }
}
