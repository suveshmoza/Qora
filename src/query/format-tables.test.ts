import { describe, expect, it } from 'vitest';

import { formatTables } from './format-tables.js';
import type { TableInfo } from './list-tables.js';

describe('formatTables', () => {
  it('returns a message when there are no tables', () => {
    expect(formatTables([])).toBe('No tables found.');
  });

  it('includes the schema in the empty result message', () => {
    expect(formatTables([], 'public')).toBe('No tables found in schema public');
  });

  it('formats a single table', () => {
    const tables: TableInfo[] = [
      {
        table_schema: 'public',
        table_name: 'users',
        table_type: 'BASE TABLE',
      },
    ];

    expect(formatTables(tables)).toBe('- public.users (BASE TABLE)');
  });

  it('formats multiple tables on separate lines', () => {
    const tables: TableInfo[] = [
      {
        table_schema: 'public',
        table_name: 'users',
        table_type: 'BASE TABLE',
      },
      {
        table_schema: 'public',
        table_name: 'orders',
        table_type: 'BASE TABLE',
      },
      {
        table_schema: 'public',
        table_name: 'user_view',
        table_type: 'VIEW',
      },
    ];

    expect(formatTables(tables)).toBe(
      [
        '- public.users (BASE TABLE)',
        '- public.orders (BASE TABLE)',
        '- public.user_view (VIEW)',
      ].join('\n'),
    );
  });

  it('uses the table schema from each table', () => {
    const tables: TableInfo[] = [
      {
        table_schema: 'public',
        table_name: 'users',
        table_type: 'BASE TABLE',
      },
      {
        table_schema: 'analytics',
        table_name: 'events',
        table_type: 'BASE TABLE',
      },
    ];

    expect(formatTables(tables)).toBe(
      ['- public.users (BASE TABLE)', '- analytics.events (BASE TABLE)'].join('\n'),
    );
  });
});
