import { type PGlite } from '@electric-sql/pglite';
import { type CompiledQuery, type DatabaseConnection, type QueryResult } from 'kysely';

export class PGliteConnection implements DatabaseConnection {
  #client: PGlite;

  constructor(client: PGlite) {
    this.#client = client;
  }

  async executeQuery<R>(compiledQuery: CompiledQuery<any>): Promise<QueryResult<R>> {
    return await this.#client.query<R>(compiledQuery.sql, [...compiledQuery.parameters]);
  }

  // eslint-disable-next-line require-yield
  async *streamQuery<R>(_compiledQuery: CompiledQuery, _chunkSize: number): AsyncIterableIterator<QueryResult<R>> {
    throw new Error('PGlite driver does not support streaming.');
  }
}
