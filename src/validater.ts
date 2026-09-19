// node-sql-parser is CJS; require it for ESM compat
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Parser } = require('node-sql-parser') as typeof import('node-sql-parser');

const parser = new Parser();

export const BLOCKED_KEYWORDS = [
  'insert',
  'update',
  'delete',
  'drop',
  'alter',
  'truncate',
  'grant',
  'revoke',
  'create',
  'copy',
  'vacuum',
  'call',
  'merge',
  'lock',
] as const;

export const FORBIDDEN_TABLES = ['pg_authid', 'pg_shadow', 'pg_roles', 'pg_user'] as const;

export const DEFAULT_ROW_LIMIT = 1000;
export const MAX_ROW_LIMIT = 5000;

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateSql(sqlRaw: string): ValidationResult {
  const sql = sqlRaw.trim();
  if (!sql) {
    return { ok: false, error: 'Empty query.' };
  }

  const stripped = sql.replace(/;+\s*$/, '');
  if (stripped.includes(';')) {
    return { ok: false, error: 'Multiple statements not allowed.' };
  }

  const lowered = stripped.toLowerCase();
  for (const kw of BLOCKED_KEYWORDS) {
    if (new RegExp(`(^|\\s)${kw}(\\s|$)`).test(lowered)) {
      return { ok: false, error: `Query contains a blocked keyword: ${kw}` };
    }
  }

  for (const table of FORBIDDEN_TABLES) {
    if (lowered.includes(table)) {
      return { ok: false, error: `Access to ${table} is not permitted.` };
    }
  }

  try {
    const ast = parser.astify(sql, { database: 'postgresql' });
    const statements = Array.isArray(ast) ? ast : [ast];
    if (statements.length !== 1) {
      return { ok: false, error: 'Multiple statements not allowed.' };
    }

    if (statements[0]?.type !== 'select') {
      return { ok: false, error: `Only SELECT queries are allowed, got ${statements[0]?.type}` };
    }
  } catch (e) {
    return { ok: false, error: `Could not parse SQL: ${(e as Error).message}` };
  }

  return { ok: true };
}

const TRAILING_LIMIT_RE = /\bLIMIT\s+(\d+)\s*;?\s*$/i;

export function enforceRowLimit(sql: string, limit = DEFAULT_ROW_LIMIT): string {
  const trimmed = sql.trim();
  const defaultLimit = Math.min(Math.max(0, limit), MAX_ROW_LIMIT);
  const match = TRAILING_LIMIT_RE.exec(trimmed);

  if (match?.[1] !== undefined) {
    const requested = Number(match[1]);
    const enforced = Number.isFinite(requested)
      ? Math.min(Math.max(0, requested), MAX_ROW_LIMIT)
      : defaultLimit;
    return trimmed.replace(TRAILING_LIMIT_RE, `LIMIT ${enforced};`);
  }

  const withoutTrailingSemi = trimmed.replace(/;+\s*$/, '');
  return `${withoutTrailingSemi} LIMIT ${defaultLimit};`;
}
