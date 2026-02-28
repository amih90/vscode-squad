import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { log } from '../utils/logger';
import { TeamRosterProvider } from '../views/rosterTreeProvider';
import { loadTeamState } from './teamState';

let isInternalChange = false;

/**
 * Setup file watcher for .squad/team.md
 * @param workspaceRoot - Root directory of the workspace
 * @param treeProvider - Tree provider to refresh on changes
 * @returns Disposable watcher
 */
export function setupWatcher(
  workspaceRoot: string,
  treeProvider: TeamRosterProvider | undefined,
): vscode.Disposable {
  const teamFilePath = path.join(workspaceRoot, '.squad', 'team.md');

  if (!fs.existsSync(teamFilePath)) {
    log('Team file does not exist, skipping watcher setup');
    return new vscode.Disposable(() => {});
  }

  log('Setting up file watcher for', teamFilePath);

  const watcher = fs.watch(teamFilePath, async (eventType) => {
    if (eventType === 'change' && !isInternalChange) {
      log('Team file changed externally');
      await loadTeamState(workspaceRoot);
      treeProvider?.refresh();
      vscode.window.showInformationMessage('Team roster updated from disk');
    }
  });

  return new vscode.Disposable(() => {
    watcher.close();
    log('File watcher closed');
  });
}

/**
 * Mark the next file change as internal (don't reload)
 */
export function markInternalChange(): void {
  isInternalChange = true;
  setTimeout(() => {
    isInternalChange = false;
  }, 500);
}
