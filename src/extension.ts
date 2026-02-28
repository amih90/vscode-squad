import * as vscode from 'vscode';
import { log } from './utils/logger';
import { TeamState, getTeamState, loadTeamState } from './team/teamState';
import { TeamRosterProvider } from './views/rosterTreeProvider';
import { setupWatcher } from './team/watcher';
import { registerCommands } from './commands/index';

let rosterProvider: TeamRosterProvider | undefined;
let disposables: vscode.Disposable[] = [];

export async function activate(context: vscode.ExtensionContext) {
  log('VS Code Squad extension activated');

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    log('No workspace folder found');
    return;
  }

  // Load team state if .squad/team.md exists
  const teamState = await loadTeamState(workspaceRoot);

  if (teamState) {
    log('Team state loaded, initializing roster view');

    // Initialize tree data provider
    rosterProvider = new TeamRosterProvider(teamState);
    const treeView = vscode.window.createTreeView('squad.rosterView', {
      treeDataProvider: rosterProvider,
    });
    disposables.push(treeView);

    // Setup file watcher
    const watcher = setupWatcher(workspaceRoot, rosterProvider);
    disposables.push(watcher);
  }

  // Register all commands
  const commandDisposables = registerCommands(context, workspaceRoot, rosterProvider);
  disposables.push(...commandDisposables);

  // Add all disposables to context
  context.subscriptions.push(...disposables);

  log('Extension ready');
}

export function deactivate() {
  log('VS Code Squad extension deactivated');
  disposables.forEach((d) => d.dispose());
  disposables = [];
}
