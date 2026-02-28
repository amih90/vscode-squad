import * as vscode from 'vscode';
export declare class ActivityProvider implements vscode.TreeDataProvider<ActivityItem> {
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<void | ActivityItem | null | undefined>;
    refresh(): void;
    getTreeItem(element: ActivityItem): vscode.TreeItem;
    getChildren(element?: ActivityItem): ActivityItem[];
}
export declare class ActivityItem extends vscode.TreeItem {
    readonly timestamp: number;
    constructor(label: string, description: string, tooltip: string, iconId: string, timestamp: number);
}
//# sourceMappingURL=activityProvider.d.ts.map