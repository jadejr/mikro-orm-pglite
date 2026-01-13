import { BasePostgreSqlPlatform } from '@mikro-orm/sql';

/**
 * This function is borrowed from the pg library at https://github.com/brianc/node-postgres
 * under the MIT license.
 */
function escapeLiteral(str: string): string {
  let hasBackslash = false;
  let escaped = "'";

  if (str == null) {
    return "''";
  }

  if (typeof str !== 'string') {
    return "''";
  }

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === "'") {
      escaped += c + c;
    } else if (c === '\\') {
      escaped += c + c;
      hasBackslash = true;
    } else {
      escaped += c;
    }
  }

  escaped += "'";

  if (hasBackslash === true) {
    escaped = ' E' + escaped;
  }

  return escaped;
}

export class PgLitePlatform extends BasePostgreSqlPlatform {
  /** @inheritDoc */
  override supportsMultipleStatements(): boolean {
    return false;
  }

  /** @inheritDoc */
  override getDefaultClientUrl(): string {
    return 'pglite://';
  }

  /** @inheritDoc */
  override escape(value: any): string {
    if (typeof value === 'bigint') {
      value = value.toString();
    }

    if (typeof value === 'string') {
      return escapeLiteral(value);
    }

    if (value instanceof Date) {
      return `'${this.formatDate(value)}'`;
    }

    if (ArrayBuffer.isView(value)) {
      return `E'\\\\x${(value as Buffer).toString('hex')}'`;
    }

    if (Array.isArray(value)) {
      return value.map((v) => this.escape(v)).join(', ');
    }

    return value as string;
  }
}
