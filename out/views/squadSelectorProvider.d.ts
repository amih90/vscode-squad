import * as vscode from 'vscode';
export declare class SquadSelectorProvider implements vscode.TreeDataProvider<SquadSelectorItem> {
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<void | SquadSelectorItem | null | undefined>;
    refresh(): void;
    getTreeItem(element: SquadSelectorItem): vscode.TreeItem;
    getChildren(element?: SquadSelectorItem): SquadSelectorItem[];
}
export declare class SquadSelectorItem extends vscode.TreeItem {
    readonly squadPath: string;
    readonly isActive: boolean;
    constructor(label: string, squadPath: string, isActive: boolean, agentCount: number);
}
//# sourceMappingURL=squadSelectorProvider.d.ts.map