import * as vscode from 'vscode';
import { log } from '../utils/logger';
import { TeamRosterProvider } from '../views/rosterTreeProvider';

export async function handleAddMember(
  context: vscode.ExtensionContext,
  workspaceRoot: string,
  rosterProvider?: TeamRosterProvider
): Promise<void> {
  log('Command: squad.addMember called');
  const name = await vscode.window.showInputBox({
    prompt: 'Enter member name',
    placeHolder: 'e.g., Alice',
  });

  if (!name) {
    return;
  }

  const role = await vscode.window.showInputBox({
    prompt: 'Enter member role',
    placeHolder: 'e.g., Frontend Dev',
  });

  if (!role) {
    return;
  }

  vscode.window.showInformationMessage(`Squad: Will add ${name} as ${role}`);
  // TODO: Implement actual add member logic
  if (rosterProvider) {
    rosterProvider.refresh();
  }
}
