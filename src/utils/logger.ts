export function log(...args: unknown[]): void {
  const timestamp = new Date().toISOString();
  console.log(`[squad] ${timestamp}`, ...args);
}

export function logError(message: string, error?: unknown): void {
  const timestamp = new Date().toISOString();
  console.error(`[squad:error] ${timestamp}`, message, error);
}
