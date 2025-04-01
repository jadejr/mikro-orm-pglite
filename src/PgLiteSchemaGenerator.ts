import { type SqlEntityManager, SqlSchemaGenerator } from '@mikro-orm/knex';
import { type MikroORM, type Transaction, Utils } from '@mikro-orm/core';

import { type PgLiteDriver } from './PgLiteDriver.js';

export class PgLiteSchemaGenerator extends SqlSchemaGenerator {
  static override register(orm: MikroORM): void {
    orm.config.registerExtension(
      '@mikro-orm/schema-generator',
      () => new PgLiteSchemaGenerator(orm.em as SqlEntityManager),
    );
  }

  // @todo: This is the same as in the parent class, but the parent wrapSchema is private
  private wrapSchemaOverride(sql: string | string[], options: { wrap?: boolean }): string {
    const array = Utils.asArray(sql);

    if (array.length === 0) {
      return '';
    }

    if (array[array.length - 1] === '') {
      array.pop();
    }

    if (options.wrap === false) {
      return array.join('\n') + '\n';
    }

    let ret = this.helper.getSchemaBeginning(this.config.get('charset'), this.options.disableForeignKeys);

    ret += array.join('\n') + '\n';
    ret += this.helper.getSchemaEnd(this.options.disableForeignKeys);

    return ret;
  }

  override async execute(sql: string, options: { wrap?: boolean; ctx?: Transaction } = {}) {
    options.wrap ??= false;
    const lines = this.wrapSchemaOverride(sql, options).split('\n');
    const groups: string[][] = [];
    let i = 0;

    for (const line of lines) {
      if (line.trim() === '') {
        if (groups[i]?.length > 0) {
          i++;
        }

        continue;
      }

      groups[i] ??= [];
      groups[i].push(line.trim());
    }

    if (groups.length === 0) {
      return;
    }

    for (const group of groups) {
      const query = group.join('\n');
      // @todo: add to type if we keep the loadQuery concept
      await (this.driver as PgLiteDriver).loadQuery(query);
    }

    return;
  }
}
