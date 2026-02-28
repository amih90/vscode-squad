import * as vscode from 'vscode';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

export async function handleViewHistory(): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  const names = [...ctx.agents.keys()];
  if (names.length === 0) {
    vscode.window.showWarningMessage('No agents in the active squad');
    return;
  }

  const agentName = await vscode.window.showQuickPick(names, {
    placeHolder: 'Select an agent to view history',
  });

  if (!agentName) {
    return;
  }

  const historyPath = path.join(ctx.rootPath, '.squad', 'agents', agentName.toLowerCase(), 'history.md');
  const uri = vscode.Uri.file(historyPath);

  try {
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
  } catch {
    vscode.window.showWarningMessage(`Squad: history.md not found for ${agentName}`);
  }
}
