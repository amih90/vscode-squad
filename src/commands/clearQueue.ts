import * as vscode from 'vscode';
import { commandQueueManager } from '../monitoring/commandQueue';

export async function handleClearQueue(): Promise<void> {
  commandQueueManager.clearCompleted();
  vscode.window.showInformationMessage('Squad: Completed queue items cleared');
}
