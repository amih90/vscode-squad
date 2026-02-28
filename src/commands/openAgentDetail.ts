import * as vscode from 'vscode';
import { AgentDetailPanel } from '../webview/agentDetailPanel';
import { squadRegistry } from '../core/squadRegistry';

export async function handleOpenAgentDetail(context: vscode.ExtensionContext, agentName?: string): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  if (!agentName) {
    const names = [...ctx.agents.keys()];
    if (names.length === 0) {
      vscode.window.showWarningMessage('No agents in the active squad');
      return;
    }
    agentName = await vscode.window.showQuickPick(names, { placeHolder: 'Select an agent' });
  }

  if (agentName) {
    AgentDetailPanel.createOrShow(context.extensionUri, agentName);
  }
}
