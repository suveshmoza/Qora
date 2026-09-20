export interface QueryResult {
  columns: string[];
  rowCount: number;
  rows: Record<string, unknown>[];
}

export function formatQueryResult(columns: string[], rows: unknown[][]): QueryResult {
  return {
    columns,
    rowCount: rows.length,
    rows: rows.map((row) => {
      const record: Record<string, unknown> = {};

      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];

        if (column === undefined) {
          continue;
        }

        record[column] = row[i] ?? null;
      }
      return record;
    }),
  };
}
