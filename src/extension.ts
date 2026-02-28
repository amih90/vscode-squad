import * as vscode from 'vscode';
import { log } from './utils/logger';
import { squadRegistry } from './core/squadRegistry';
import { eventBus } from './core/eventBus';
import { TeamRosterProvider } from './views/rosterTreeProvider';
import { SquadSelectorProvider } from './views/squadSelectorProvider';
import { ActivityProvider } from './views/activityProvider';
import { registerCommands } from './commands/index';

let outputChannel: vscode.OutputChannel;

export async function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Squad');
  log('VS Code Squad extension v2 activated');

  // Scan workspace folders for squads
  await squadRegistry.scanWorkspaceFolders();

  // Create tree view providers
  const selectorProvider = new SquadSelectorProvider();
  const rosterProvider = new TeamRosterProvider();
  const activityProvider = new ActivityProvider();

  // Register tree views
  const selectorView = vscode.window.createTreeView('squad.squadSelector', {
    treeDataProvider: selectorProvider,
  });
  const rosterView = vscode.window.createTreeView('squad.rosterView', {
    treeDataProvider: rosterProvider,
  });
  const activityView = vscode.window.createTreeView('squad.activityView', {
    treeDataProvider: activityProvider,
  });

  // Status bar items
  const squadNameItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );
  squadNameItem.command = 'squad.switchSquad';
  const healthItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    99,
  );
  healthItem.command = 'squad.openDashboard';
  updateStatusBar(squadNameItem, healthItem);

  // Event listeners
  eventBus.on('team-changed', () => {
    rosterProvider.refresh();
    selectorProvider.refresh();
    updateStatusBar(squadNameItem, healthItem);
  });
  eventBus.on('squad-activated', () => {
    rosterProvider.refresh();
    selectorProvider.refresh();
    updateStatusBar(squadNameItem, healthItem);
  });
  eventBus.on('log-entry', () => {
    activityProvider.refresh();
  });
  eventBus.on('stats-updated', () => {
    updateStatusBar(squadNameItem, healthItem);
  });

  // Workspace folder changes
  const folderWatcher = vscode.workspace.onDidChangeWorkspaceFolders(
    async (e) => {
      for (const added of e.added) {
        await squadRegistry.registerSquad(added.uri.fsPath);
      }
      for (const removed of e.removed) {
        squadRegistry.unregisterSquad(removed.uri.fsPath);
      }
      selectorProvider.refresh();
      rosterProvider.refresh();
    },
  );

  // Register all commands
  const commandDisposables = registerCommands(context, rosterProvider);

  // Auto-open dashboard if configured
  const autoOpen = vscode.workspace
    .getConfiguration('squad')
    .get<boolean>('autoOpenDashboard', false);
  if (autoOpen && squadRegistry.activeContext) {
    vscode.commands.executeCommand('squad.openDashboard');
  }

  // Push all disposables
  context.subscriptions.push(
    outputChannel,
    selectorView,
    rosterView,
    activityView,
    squadNameItem,
    healthItem,
    folderWatcher,
    ...commandDisposables,
    {
      dispose: () => {
        squadRegistry.dispose();
        eventBus.dispose();
      },
    },
  );
}

function updateStatusBar(
  nameItem: vscode.StatusBarItem,
  healthItem: vscode.StatusBarItem,
): void {
  const ctx = squadRegistry.activeContext;
  if (ctx) {
    nameItem.text = `$(people) ${ctx.teamState.projectContext?.description ?? 'Squad'}`;
    nameItem.show();
    const score = ctx.statistics.healthScore;
    const emoji =
      score >= 80 ? '$(pass)' : score >= 50 ? '$(warning)' : '$(error)';
    healthItem.text = `${emoji} ${score}`;
    healthItem.tooltip = `Squad Health Score: ${score}/100`;
    healthItem.show();
  } else {
    nameItem.hide();
    healthItem.hide();
  }
}

export function deactivate() {
  log('VS Code Squad extension deactivated');
}
