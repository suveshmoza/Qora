import { describe, expect, it } from 'vitest';

import type { ColumnInfo } from './describe-table.js';
import { formatColumns } from './format-columns.js';

describe('formatColumns', () => {
  it('returns a not-found message when there are no columns', () => {
    expect(formatColumns([], 'analytics', 'orders')).toBe(
      "Table 'analytics.orders' not found (or not visible to this role).",
    );
  });

  it('formats nullable and non-nullable columns', () => {
    const columns: ColumnInfo[] = [
      { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
      { column_name: 'email', data_type: 'text', is_nullable: 'YES' },
    ];

    expect(formatColumns(columns, 'analytics', 'orders')).toBe(
      ['Columns of analytics.orders:', '- id — integer (NOT NULL)', '- email — text'].join('\n'),
    );
  });

  it('formats a single column', () => {
    const columns: ColumnInfo[] = [
      { column_name: 'name', data_type: 'character varying', is_nullable: 'YES' },
    ];

    expect(formatColumns(columns, 'public', 'users')).toBe(
      ['Columns of public.users:', '- name — character varying'].join('\n'),
    );
  });
});
