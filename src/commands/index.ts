import * as vscode from 'vscode';
import { log } from '../utils/logger';
import { TeamRosterProvider } from '../views/rosterTreeProvider';

// Original commands
import { handleInitialize } from './initialize';
import { handleOpenRoster } from './openRoster';
import { handleAddMember } from './addMember';
import { handleRemoveMember } from './removeMember';
import { handleEditMember } from './editMember';
import { handleRefreshRoster } from './refreshRoster';
import { handleOpenTeamFile } from './openTeamFile';

// Dashboard commands
import { handleOpenDashboard } from './openDashboard';
import { handleOpenAgentDetail } from './openAgentDetail';

// Monitoring commands
import { handleShowLogs } from './showLogs';
import { handleClearLogs } from './clearLogs';
import { handleFilterLogs } from './filterLogs';

// Queue commands
import { handleEnqueueCommand } from './enqueueCommand';
import { handleViewQueue } from './viewQueue';
import { handleClearQueue } from './clearQueue';

// Multi-squad commands
import { handleSwitchSquad } from './switchSquad';
import { handleCreateSquad } from './createSquad';
import { handleDeleteSquad } from './deleteSquad';

// Insight commands
import { handleViewDecisions } from './viewDecisions';
import { handleViewHistory } from './viewHistory';
import { handleShowHealthScore } from './showHealthScore';

// Automation commands
import { handleRunCeremony } from './runCeremony';
import { handleEditCharter } from './editCharter';

// Search commands
import { handleSearchSquads } from './searchSquads';

// Stats commands
import { handleShowStats } from './showStats';

export function registerCommands(
  context: vscode.ExtensionContext,
  rosterProvider?: TeamRosterProvider
): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  // --- Original 7 commands ---
  disposables.push(
    vscode.commands.registerCommand('squad.initialize', () =>
      handleInitialize(context)
    ),
    vscode.commands.registerCommand('squad.openRoster', () =>
      handleOpenRoster(context, rosterProvider)
    ),
    vscode.commands.registerCommand('squad.addMember', () =>
      handleAddMember(context, rosterProvider)
    ),
    vscode.commands.registerCommand('squad.removeMember', () =>
      handleRemoveMember(context, rosterProvider)
    ),
    vscode.commands.registerCommand('squad.editMember', () =>
      handleEditMember(context, rosterProvider)
    ),
    vscode.commands.registerCommand('squad.refreshRoster', () =>
      handleRefreshRoster(context, rosterProvider)
    ),
    vscode.commands.registerCommand('squad.openTeamFile', () =>
      handleOpenTeamFile(context)
    ),
  );

  // --- Dashboard commands ---
  disposables.push(
    vscode.commands.registerCommand('squad.openDashboard', () =>
      handleOpenDashboard(context)
    ),
    vscode.commands.registerCommand('squad.openAgentDetail', (agentName?: string) =>
      handleOpenAgentDetail(context, agentName)
    ),
  );

  // --- Monitoring commands ---
  disposables.push(
    vscode.commands.registerCommand('squad.showLogs', () =>
      handleShowLogs()
    ),
    vscode.commands.registerCommand('squad.clearLogs', () =>
      handleClearLogs()
    ),
    vscode.commands.registerCommand('squad.filterLogs', () =>
      handleFilterLogs()
    ),
  );

  // --- Queue commands ---
  disposables.push(
    vscode.commands.registerCommand('squad.enqueueCommand', () =>
      handleEnqueueCommand()
    ),
    vscode.commands.registerCommand('squad.viewQueue', () =>
      handleViewQueue()
    ),
    vscode.commands.registerCommand('squad.clearQueue', () =>
      handleClearQueue()
    ),
  );

  // --- Multi-squad commands ---
  disposables.push(
    vscode.commands.registerCommand('squad.switchSquad', (squadPath?: string) =>
      handleSwitchSquad(squadPath)
    ),
    vscode.commands.registerCommand('squad.createSquad', () =>
      handleCreateSquad()
    ),
    vscode.commands.registerCommand('squad.deleteSquad', () =>
      handleDeleteSquad()
    ),
  );

  // --- Insight commands ---
  disposables.push(
    vscode.commands.registerCommand('squad.viewDecisions', () =>
      handleViewDecisions()
    ),
    vscode.commands.registerCommand('squad.viewHistory', () =>
      handleViewHistory()
    ),
    vscode.commands.registerCommand('squad.showHealthScore', () =>
      handleShowHealthScore()
    ),
  );

  // --- Automation commands ---
  disposables.push(
    vscode.commands.registerCommand('squad.runCeremony', () =>
      handleRunCeremony()
    ),
    vscode.commands.registerCommand('squad.editCharter', () =>
      handleEditCharter()
    ),
  );

  // --- Search commands ---
  disposables.push(
    vscode.commands.registerCommand('squad.searchSquads', () =>
      handleSearchSquads()
    ),
  );

  // --- Stats commands ---
  disposables.push(
    vscode.commands.registerCommand('squad.showStats', () =>
      handleShowStats()
    ),
  );

  log('All 25 commands registered');
  return disposables;
}
