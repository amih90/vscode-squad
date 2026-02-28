import * as vscode from 'vscode';
export declare class DashboardPanel {
    static currentPanel: DashboardPanel | undefined;
    private readonly panel;
    private readonly extensionUri;
    private disposables;
    static createOrShow(extensionUri: vscode.Uri): DashboardPanel;
    private constructor();
    private updateHtml;
    private getHtmlContent;
    private sendStateUpdate;
    private handleWebviewMessage;
    private setupEventListeners;
    dispose(): void;
}
//# sourceMappingURL=dashboardPanel.d.ts.map