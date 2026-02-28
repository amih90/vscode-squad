import * as vscode from 'vscode';
import { log } from '../utils/logger';
import { handleCreateSquad } from './createSquad';

export async function handleInitialize(context: vscode.ExtensionContext): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showWarningMessage('No workspace folder open');
    return;
  }
  log('Command: squad.initialize called');
  await handleCreateSquad();
}
