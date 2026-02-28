import * as vscode from 'vscode';
import * as path from 'path';
import { log } from '../utils/logger';
import { squadRegistry } from '../core/squadRegistry';

export async function handleOpenTeamFile(
  context: vscode.ExtensionContext
): Promise<void> {
  log('Command: squad.openTeamFile called');
  const squadDir = squadRegistry.activeContext?.squadDir;
  if (!squadDir) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }
  const teamFilePath = path.join(squadDir, 'team.md');
  const teamFileUri = vscode.Uri.file(teamFilePath);

  try {
    const doc = await vscode.workspace.openTextDocument(teamFileUri);
    await vscode.window.showTextDocument(doc);
  } catch (err) {
    log('Error opening team file:', err);
    vscode.window.showErrorMessage('Squad: Failed to open team file');
  }
}
