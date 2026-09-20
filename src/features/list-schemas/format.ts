export function formatSchemas(schemas: string[]): string {
  if (schemas.length === 0) {
    return 'No user schemas found.';
  }
  return schemas.map((schema) => `- ${schema}`).join('\n');
}
