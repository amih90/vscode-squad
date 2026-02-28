import * as vscode from 'vscode';
import { logError } from './logger';

export class SquadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SquadError';
  }
}

export async function handleError(error: unknown, context: string = ''): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  logError(`[${context}] ${message}`, error);
  await vscode.window.showErrorMessage(`Squad Error: ${message}`);
}
