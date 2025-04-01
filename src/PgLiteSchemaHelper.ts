import { Utils, type Dictionary } from '@mikro-orm/core';
import { type AbstractSqlConnection, type SchemaHelper } from '@mikro-orm/knex';
import { PostgreSqlSchemaHelper } from '@mikro-orm/postgresql';

// This type (and this entire file) will disappear once https://github.com/mikro-orm/mikro-orm/pull/6501
// is merged into v7, so don't bother exporting it.
type EnumQueryResult = {
  enum_name: string;
  schema_name: string;
  enum_value: string[] | string;
};

export class PgLiteSchemaHelper extends PostgreSqlSchemaHelper implements SchemaHelper {
  // pglite automatically unmarshalls arrays, so we don't need to do it manually
  override async getNativeEnumDefinitions(
    connection: AbstractSqlConnection,
    schemas: string[],
  ): Promise<Dictionary<{ name: string; schema?: string; items: string[] }>> {
    const uniqueSchemas = Utils.unique(schemas);
    const res = await connection.execute<EnumQueryResult[]>(
      `select t.typname as enum_name, n.nspname as schema_name, array_agg(e.enumlabel order by e.enumsortorder) as enum_value
        from pg_type t
        join pg_enum e on t.oid = e.enumtypid
        join pg_catalog.pg_namespace n on n.oid = t.typnamespace
        where n.nspname in (${Array(uniqueSchemas.length).fill('?').join(', ')})
        group by t.typname, n.nspname`,
      uniqueSchemas,
    );

    return res.reduce((o: Dictionary, row) => {
      let name = row.enum_name;

      if (row.schema_name && row.schema_name !== this.platform.getDefaultSchemaName()) {
        name = row.schema_name + '.' + name;
      }

      o[name] = {
        name: row.enum_name,
        schema: row.schema_name,
        items: Array.isArray(row.enum_value) ? row.enum_value : this.platform.unmarshallArray(row.enum_value),
      };

      return o;
    }, {});
  }
}
