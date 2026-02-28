import * as vscode from 'vscode';
import { log } from '../utils/logger';
import { TeamRosterProvider } from '../views/rosterTreeProvider';

export async function handleRemoveMember(
  context: vscode.ExtensionContext,
  rosterProvider?: TeamRosterProvider
): Promise<void> {
  log('Command: squad.removeMember called');
  const memberName = await vscode.window.showInputBox({
    prompt: 'Enter the name of the member to remove',
  });

  if (!memberName) {
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Remove ${memberName} from team? This cannot be undone.`,
    { modal: true },
    'Remove'
  );

  if (confirm === 'Remove') {
    vscode.window.showInformationMessage(`Squad: Will remove ${memberName}`);
    // TODO: Implement actual remove member logic
    if (rosterProvider) {
      rosterProvider.refresh();
    }
  }
}
