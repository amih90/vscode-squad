import * as vscode from 'vscode';
import { log } from '../utils/logger';
import { TeamRosterProvider } from '../views/rosterTreeProvider';
import { handleInitialize } from './initialize';
import { handleOpenRoster } from './openRoster';
import { handleAddMember } from './addMember';
import { handleRemoveMember } from './removeMember';
import { handleEditMember } from './editMember';
import { handleRefreshRoster } from './refreshRoster';
import { handleOpenTeamFile } from './openTeamFile';

export function registerCommands(
  context: vscode.ExtensionContext,
  workspaceRoot: string,
  rosterProvider?: TeamRosterProvider
): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  disposables.push(
    vscode.commands.registerCommand('squad.initialize', () =>
      handleInitialize(context, workspaceRoot)
    ),
    vscode.commands.registerCommand('squad.openRoster', () =>
      handleOpenRoster(context, workspaceRoot, rosterProvider)
    ),
    vscode.commands.registerCommand('squad.addMember', () =>
      handleAddMember(context, workspaceRoot, rosterProvider)
    ),
    vscode.commands.registerCommand('squad.removeMember', () =>
      handleRemoveMember(context, workspaceRoot, rosterProvider)
    ),
    vscode.commands.registerCommand('squad.editMember', () =>
      handleEditMember(context, workspaceRoot, rosterProvider)
    ),
    vscode.commands.registerCommand('squad.refreshRoster', () =>
      handleRefreshRoster(context, workspaceRoot, rosterProvider)
    ),
    vscode.commands.registerCommand('squad.openTeamFile', () =>
      handleOpenTeamFile(context, workspaceRoot, rosterProvider)
    )
  );

  log('All 7 commands registered');
  return disposables;
}
