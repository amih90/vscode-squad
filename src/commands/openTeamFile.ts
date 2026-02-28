import * as vscode from 'vscode';
import * as path from 'path';
import { log } from '../utils/logger';
import { squadRegistry } from '../core/squadRegistry';

export async function handleOpenTeamFile(
  context: vscode.ExtensionContext
): Promise<void> {
  log('Command: squad.openTeamFile called');
  const workspaceRoot = squadRegistry.activeContext?.rootPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showWarningMessage('No workspace folder open');
    return;
  }
  const teamFilePath = path.join(workspaceRoot, '.squad', 'team.md');
  const teamFileUri = vscode.Uri.file(teamFilePath);

  try {
    const doc = await vscode.workspace.openTextDocument(teamFileUri);
    await vscode.window.showTextDocument(doc);
  } catch (err) {
    log('Error opening team file:', err);
    vscode.window.showErrorMessage('Squad: Failed to open team file');
  }
}
