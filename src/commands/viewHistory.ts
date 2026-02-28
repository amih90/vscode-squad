import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

export async function handleViewHistory(agentNameArg?: string): Promise<void> {
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

  let agentName = agentNameArg;
  if (!agentName) {
    agentName = await vscode.window.showQuickPick(names, {
      placeHolder: 'Select an agent to view history',
    });
  }
  if (!agentName) { return; }

  const slug = agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const agentDir = path.join(ctx.squadDir, 'agents', slug);
  const historyPath = path.join(agentDir, 'history.md');

  // Scaffold if missing
  if (!fs.existsSync(historyPath)) {
    fs.mkdirSync(agentDir, { recursive: true });
    fs.writeFileSync(historyPath, `# ${agentName} History\n\n| Date | Action | Details |\n|------|--------|--------|\n`, 'utf-8');
  }

  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(historyPath));
  await vscode.window.showTextDocument(doc, { preview: false });
}
