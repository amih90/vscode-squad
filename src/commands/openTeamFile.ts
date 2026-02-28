import * as vscode from 'vscode';
import * as path from 'path';
import { log } from '../utils/logger';
import { TeamRosterProvider } from '../views/rosterTreeProvider';

export async function handleOpenTeamFile(
  context: vscode.ExtensionContext,
  workspaceRoot: string,
  rosterProvider?: TeamRosterProvider
): Promise<void> {
  log('Command: squad.openTeamFile called');
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
