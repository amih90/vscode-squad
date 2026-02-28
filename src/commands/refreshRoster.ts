import * as vscode from 'vscode';
import { log } from '../utils/logger';
import { TeamRosterProvider } from '../views/rosterTreeProvider';

export async function handleRefreshRoster(
  context: vscode.ExtensionContext,
  workspaceRoot: string,
  rosterProvider?: TeamRosterProvider
): Promise<void> {
  log('Command: squad.refreshRoster called');
  if (rosterProvider) {
    rosterProvider.refresh();
    vscode.window.showInformationMessage('Squad: Roster refreshed');
  } else {
    vscode.window.showWarningMessage('Squad: No roster loaded');
  }
}
