import * as vscode from 'vscode';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

export async function handleEditCharter(): Promise<void> {
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
    placeHolder: 'Select an agent to edit charter',
  });

  if (!agentName) {
    return;
  }

  const charterPath = path.join(ctx.rootPath, '.squad', 'agents', agentName.toLowerCase(), 'charter.md');
  const uri = vscode.Uri.file(charterPath);

  try {
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);
  } catch {
    vscode.window.showWarningMessage(`Squad: charter.md not found for ${agentName}`);
  }
}
