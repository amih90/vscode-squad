import * as vscode from 'vscode';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

export async function handleViewDecisions(): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  const decisionsPath = path.join(ctx.squadDir, 'decisions.md');
  const uri = vscode.Uri.file(decisionsPath);

  try {
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
  } catch {
    vscode.window.showWarningMessage('Squad: decisions.md not found');
  }
}
