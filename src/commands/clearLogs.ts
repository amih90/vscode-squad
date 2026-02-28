import * as vscode from 'vscode';
import { logStore } from '../monitoring/logStore';

export async function handleClearLogs(): Promise<void> {
  logStore.clear();
  vscode.window.showInformationMessage('Squad: Logs cleared');
}
