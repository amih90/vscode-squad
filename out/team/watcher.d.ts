import * as vscode from 'vscode';
import { TeamRosterProvider } from '../views/rosterTreeProvider';
/**
 * Setup file watcher for .squad/team.md
 * @param workspaceRoot - Root directory of the workspace
 * @param treeProvider - Tree provider to refresh on changes
 * @returns Disposable watcher
 */
export declare function setupWatcher(workspaceRoot: string, treeProvider: TeamRosterProvider | undefined): vscode.Disposable;
/**
 * Mark the next file change as internal (don't reload)
 */
export declare function markInternalChange(): void;
//# sourceMappingURL=watcher.d.ts.map