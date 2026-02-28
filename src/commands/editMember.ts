import * as vscode from 'vscode';
import { log } from '../utils/logger';
import { TeamRosterProvider } from '../views/rosterTreeProvider';

export async function handleEditMember(
  context: vscode.ExtensionContext,
  rosterProvider?: TeamRosterProvider
): Promise<void> {
  log('Command: squad.editMember called');
  const memberName = await vscode.window.showInputBox({
    prompt: 'Enter the name of the member to edit',
  });

  if (!memberName) {
    return;
  }

  const newRole = await vscode.window.showInputBox({
    prompt: 'Enter new role',
    placeHolder: 'e.g., Frontend Dev',
  });

  if (!newRole) {
    return;
  }

  vscode.window.showInformationMessage(`Squad: Will update ${memberName} to ${newRole}`);
  // TODO: Implement actual edit member logic
  if (rosterProvider) {
    rosterProvider.refresh();
  }
}
