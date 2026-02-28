import * as vscode from 'vscode';
import { TeamState } from '../team/teamState';
export declare class TeamRosterProvider implements vscode.TreeDataProvider<RosterItem> {
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<RosterItem | undefined | null | void>;
    private state;
    constructor(initialState: TeamState | null);
    refresh(): void;
    getTreeItem(element: RosterItem): vscode.TreeItem | Thenable<vscode.TreeItem>;
    getChildren(element?: RosterItem): Thenable<RosterItem[]>;
    getParent(element: RosterItem): vscode.ProviderResult<RosterItem>;
}
export declare class RosterItem extends vscode.TreeItem {
    label: string;
    tooltip: string;
    collapsibleState: vscode.TreeItemCollapsibleState;
    parent?: string | undefined;
    contextValue?: string | undefined;
    constructor(label: string, tooltip: string, collapsibleState: vscode.TreeItemCollapsibleState, parent?: string | undefined, contextValue?: string | undefined);
}
//# sourceMappingURL=rosterTreeProvider.d.ts.map