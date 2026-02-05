export function getEnv(key: string): string {
  const value = process.env[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`❌ Variable de entorno ${key} no está definida`);
  }

  return value;
}
