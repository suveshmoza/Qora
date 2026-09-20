import { BLOCKED_KEYWORDS, enforceRowLimit, FORBIDDEN_TABLES, validateSql } from './validator.js';

describe('validateSql', () => {
  it('should return an error if the query is empty', () => {
    const result = validateSql('');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Empty query.');
  });

  it('should retur an error if the query contains multiple statements', () => {
    const result = validateSql('SELECT 1; SELECT 2;');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Multiple statements not allowed.');
  });

  it.each(BLOCKED_KEYWORDS)('should return an error if the query contains %s', (keyword) => {
    const result = validateSql(`${keyword} * FROM users;`);
    expect(result.ok).toBe(false);
    expect(result.error).toBe(`Query contains a blocked keyword: ${keyword}`);
  });

  it.each(FORBIDDEN_TABLES)(
    'should return an error if the query tries to access %s tables',
    (table) => {
      const result = validateSql(`Select * FROM ${table};`);
      expect(result.ok).toBe(false);
      expect(result.error).toBe(`Access to ${table} is not permitted.`);
    },
  );

  it('should return an error if it fails to parse the query', () => {
    const result = validateSql('SELECT * FROM users WHERE');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Could not parse SQL:');
  });

  it('should return true when query is a SELECT query', () => {
    const result = validateSql('SELECT * FROM users;');
    expect(result.ok).toBe(true);
  });
});

describe('enforceRowLimit', () => {
  it('adds DEFAULT_ROW_LIMIT when the query has no LIMIT', () => {
    expect(enforceRowLimit('SELECT * FROM users;')).toBe('SELECT * FROM users LIMIT 1000;');
    expect(enforceRowLimit('SELECT * FROM users')).toBe('SELECT * FROM users LIMIT 1000;');
  });

  it('keeps a LIMIT below DEFAULT_ROW_LIMIT', () => {
    expect(enforceRowLimit('SELECT * FROM users LIMIT 50;')).toBe('SELECT * FROM users LIMIT 50;');
  });

  it('keeps a LIMIT between DEFAULT_ROW_LIMIT and MAX_ROW_LIMIT', () => {
    expect(enforceRowLimit('SELECT * FROM users LIMIT 2500;')).toBe(
      'SELECT * FROM users LIMIT 2500;',
    );
  });

  it('caps a LIMIT above MAX_ROW_LIMIT', () => {
    expect(enforceRowLimit('SELECT * FROM users LIMIT 1000000;')).toBe(
      'SELECT * FROM users LIMIT 5000;',
    );
  });

  it('uses the provided default when no LIMIT is present, capped at MAX', () => {
    expect(enforceRowLimit('SELECT * FROM users;', 200)).toBe('SELECT * FROM users LIMIT 200;');
    expect(enforceRowLimit('SELECT * FROM users;', 99999)).toBe('SELECT * FROM users LIMIT 5000;');
  });
});
