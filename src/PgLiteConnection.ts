import { readFile } from 'node:fs/promises';

import { PGlite, types } from '@electric-sql/pglite';
import { citext } from '@electric-sql/pglite/contrib/citext';
import { vector } from '@electric-sql/pglite/vector';
import { AbstractSqlConnection, type ConnectionConfig, Dictionary, Utils } from '@mikro-orm/sql';
import { type QueryResult } from 'kysely';

import { PGliteDialect } from './kysely/pglite-dialect';
import { type PGliteDialectConfig } from './kysely/pglite-dialect-config.js';
type PgLiteConnectionConfig = ConnectionConfig & PGliteDialectConfig;

export class PgLiteConnection extends AbstractSqlConnection {
  protected database!: PGlite;

  override createKyselyDialect(overrides: Dictionary) {
    const options = this.mapOptions(overrides);

    this.database = new PGlite(options.PGliteOptions);
    const dialect = new PGliteDialect({
      PGlite: this.database,
      onCreateConnection: this.config.get('onCreateConnection'),
    });

    return dialect;
  }

  mapOptions(overrides: Dictionary): PgLiteConnectionConfig {
    const ret = { ...this.getConnectionOptions() } as PgLiteConnectionConfig;

    // use `select typname, oid, typarray from pg_type order by oid` to get the list of OIDs
    const pgLiteOptions: PGliteDialectConfig['PGliteOptions'] = {};
    pgLiteOptions.parsers = {
      [types.DATE]: (str: string) => str,
      [types.TIMESTAMP]: (str: string) => str,
      [types.TIMESTAMPTZ]: (str: string) => str,
      [types.INTERVAL]: (str: string) => str,
      // Point type (borrowed from pg-types under the MIT license)
      600: (str: string) => {
        if (str[0] !== '(') {
          return null;
        }

        const parsedString = str.substring(1, str.length - 1).split(',');

        return {
          x: parseFloat(parsedString[0]),
          y: parseFloat(parsedString[1]),
        };
      },
    };
    // if not using 'host', then there is no dataDir.
    if (ret.host) {
      pgLiteOptions.dataDir = ret.host;
    }
    if (ret.user) {
      pgLiteOptions.username = ret.user;
    }

    pgLiteOptions.extensions = { citext, vector };

    ret.PGliteOptions = pgLiteOptions;

    return Utils.mergeConfig(ret, overrides);
  }

  override transformRawResult<T>(res: QueryResult<T>, method?: 'all' | 'get' | 'run'): T {
    if (method === 'get') {
      return res.rows[0];
    }

    if (method === 'all') {
      return res.rows as T;
    }

    return {
      affectedRows: Number(res.numAffectedRows) > 0 ? Number(res.numAffectedRows) : res.rows.length,
      ...(res.insertId ? { insertId: res.insertId } : {}),
      row: res.rows[0],
      rows: res.rows,
    } as unknown as T;
  }

  override async loadFile(path: string): Promise<void> {
    await this.ensureConnection();
    const sql = await readFile(path);
    await this.database.exec(sql.toString());
  }

  async loadQuery(query: string): Promise<void> {
    await this.ensureConnection();
    await this.database.exec(query);
  }

  override getConnectionOptions(): ConnectionConfig {
    const ret: ConnectionConfig = {};

    if (this.options.clientUrl) {
      const url = new URL(this.options.clientUrl);
      this.options.host = ret.host = this.options.host ?? decodeURIComponent(url.pathname);
      this.options.user = ret.user = this.options.user ?? decodeURIComponent(url.username);
      const queryDbName = url.searchParams.has('dbName')
        ? decodeURIComponent(url.searchParams.get('dbName')!)
        : undefined;
      this.options.dbName = ret.database = queryDbName ?? this.options.dbName;
      this.config.set('dbName', ret.database);

      if (this.options.schema || url.searchParams.has('schema')) {
        this.options.schema = ret.schema = this.options.schema ?? decodeURIComponent(url.searchParams.get('schema')!);
        this.config.set('schema', ret.schema);
      }
    } else {
      const url = new URL(this.config.getClientUrl());
      this.options.host = ret.host = this.options.host ?? this.config.get('host', decodeURIComponent(url.pathname));
      this.options.user = ret.user = this.options.user ?? this.config.get('user', decodeURIComponent(url.username));
      if (this.options.dbName || url.searchParams.has('dbName')) {
        this.options.dbName = ret.database =
          this.options.dbName ?? this.config.get('dbName', decodeURIComponent(url.searchParams.get('dbName')!));
        this.config.set('dbName', ret.database);
      }
    }

    return ret;
  }

  override getClientUrl(): string {
    const options = this.getConnectionOptions();

    const params = new URLSearchParams({
      ...(options.database ? { dbName: options.database } : {}),
      ...(options.schema && options.schema !== this.platform.getDefaultSchemaName() ? { schema: options.schema } : {}),
    });

    const user = options.user ? `${options.user}@` : '';
    const host = options.host ? `${options.host.replace(/\/$/, '').replace(/^\//, '')}` : '';
    const queryParams = [...params.keys()].length > 0 ? `?${params.toString()}` : '';

    const urlHost = host ? `localhost` : '';
    const dataDir = host ? `/${host}` : '';

    return `pglite://${user}${urlHost}${dataDir}${queryParams}`;
  }
}
