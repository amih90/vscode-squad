import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

export async function handleOpenRouting(): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  const routingPath = path.join(ctx.squadDir, 'routing.md');
  if (!fs.existsSync(routingPath)) {
    fs.writeFileSync(routingPath, `# Routing Rules

## Fallback

No routing rules defined yet. Add patterns to route work to agents.
`, 'utf-8');
  }

  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(routingPath));
  await vscode.window.showTextDocument(doc, { preview: false });
}
