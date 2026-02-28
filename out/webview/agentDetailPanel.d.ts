import * as vscode from 'vscode';
export declare class AgentDetailPanel {
    private static panels;
    private readonly panel;
    private readonly agentName;
    private readonly extensionUri;
    private disposables;
    static createOrShow(extensionUri: vscode.Uri, agentName: string): AgentDetailPanel;
    private constructor();
    private updateHtml;
    private getHtmlContent;
    private readAgentFile;
    private sendAgentState;
    private handleWebviewMessage;
    private setupEventListeners;
    dispose(): void;
}
//# sourceMappingURL=agentDetailPanel.d.ts.map