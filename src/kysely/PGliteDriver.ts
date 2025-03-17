import {
  CompiledQuery,
  type TransactionSettings,
  createQueryId,
  type DatabaseConnection,
  type QueryCompiler,
} from 'kysely';
import { type PGlite } from '@electric-sql/pglite';
import { parseSavepointCommand } from './parser/savepoint-parser.js';

import { PGliteConnection } from './PGliteConnection.js';

export interface PgLiteDriverConfig {
  onCreateConnection?: (connection: DatabaseConnection) => Promise<void>;
}

export class PGliteDriver {
  #client: PGlite | undefined;
  #config: PgLiteDriverConfig = {};
  #connection: DatabaseConnection | undefined;

  constructor(client: PGlite, config: PgLiteDriverConfig) {
    this.#client = client;
    this.#config = config;
  }

  async init(): Promise<void> {
    // @todo maybe use?
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    if (this.#client === undefined) {
      throw new Error('PGLite not initialized');
    }
    if (this.#connection) {
      return this.#connection;
    }
    this.#connection = new PGliteConnection(this.#client);
    if (this.#connection && this.#config.onCreateConnection) {
      await this.#config.onCreateConnection(this.#connection);
    }

    return this.#connection;
  }

  async releaseConnection(connection: DatabaseConnection): Promise<void> {
    return;
  }

  async beginTransaction(connection: DatabaseConnection, settings: TransactionSettings): Promise<void> {
    if (settings.isolationLevel || settings.accessMode) {
      let sql = 'start transaction';

      if (settings.isolationLevel) {
        sql += ` isolation level ${settings.isolationLevel}`;
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
    await this.#client?.close();
    this.#client = undefined;
  }
}
