import * as vscode from 'vscode';
export declare class TeamRosterProvider implements vscode.TreeDataProvider<RosterItem> {
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<void | RosterItem | null | undefined>;
    refresh(): void;
    getTreeItem(element: RosterItem): vscode.TreeItem;
    getChildren(element?: RosterItem): RosterItem[];
    getParent(element: RosterItem): vscode.ProviderResult<RosterItem>;
}
export declare class RosterItem extends vscode.TreeItem {
    parent?: string | undefined;
    constructor(label: string, tooltip: string, collapsibleState: vscode.TreeItemCollapsibleState, parent?: string | undefined, contextValue?: string, description?: string);
}
//# sourceMappingURL=rosterTreeProvider.d.ts.map