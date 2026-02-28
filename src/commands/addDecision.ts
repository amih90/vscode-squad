import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

export async function handleAddDecision(): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  const title = await vscode.window.showInputBox({
    prompt: 'Decision title',
    placeHolder: 'e.g., Use PostgreSQL for user data',
  });
  if (!title) { return; }

  const agents = [...ctx.agents.keys()];
  const author = await vscode.window.showQuickPick(['Team', ...agents], {
    placeHolder: 'Who made this decision?',
  });
  if (!author) { return; }

  const reasoning = await vscode.window.showInputBox({
    prompt: 'Brief reasoning (optional)',
    placeHolder: 'e.g., Better query performance for our access patterns',
  });

  const decisionsFile = path.join(ctx.squadDir, 'decisions.md');
  const date = new Date().toISOString().split('T')[0];
  const entry = `\n## ${title}\n\n- **Date:** ${date}\n- **Author:** ${author}\n- **Reasoning:** ${reasoning || '(none provided)'}\n- **Status:** Accepted\n`;

  let existing = '# Decisions\n';
  if (fs.existsSync(decisionsFile)) {
    existing = fs.readFileSync(decisionsFile, 'utf-8');
  }

  fs.writeFileSync(decisionsFile, existing + entry, 'utf-8');
  vscode.window.showInformationMessage(`Decision recorded: ${title}`);

  // Open the file to show the new entry
  const doc = await vscode.workspace.openTextDocument(decisionsFile);
  await vscode.window.showTextDocument(doc, { preview: false });
}
