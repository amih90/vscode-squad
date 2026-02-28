import * as vscode from 'vscode';
import { log } from '../utils/logger';
import { TeamRosterProvider } from '../views/rosterTreeProvider';

export async function handleOpenRoster(
  context: vscode.ExtensionContext,
  workspaceRoot: string,
  rosterProvider?: TeamRosterProvider
): Promise<void> {
  log('Command: squad.openRoster called');
  vscode.window.showInformationMessage('Squad: Roster view is now visible in the sidebar');
  // TODO: Focus the tree view if it exists
}
