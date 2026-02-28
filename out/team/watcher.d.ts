import * as vscode from 'vscode';
import { TeamRosterProvider } from '../views/rosterTreeProvider';
/**
 * Setup file watcher for team.md in a squad directory
 * @param squadDir - Root directory of the squad (containing team.md)
 * @param treeProvider - Tree provider to refresh on changes
 * @returns Disposable watcher
 */
export declare function setupWatcher(squadDir: string, treeProvider: TeamRosterProvider | undefined): vscode.Disposable;
/**
 * Mark the next file change as internal (don't reload)
 */
export declare function markInternalChange(): void;
//# sourceMappingURL=watcher.d.ts.map