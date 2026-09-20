import { describe, expect, it } from 'vitest';

import { formatSchemas } from './format.js';

describe('formatSchemas', () => {
  it('returns a message when there are no schemas', () => {
    expect(formatSchemas([])).toBe('No user schemas found.');
  });

  it('formats schema names as a list', () => {
    expect(formatSchemas(['analytics', 'public'])).toBe('- analytics\n- public');
  });
});
