import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

export async function handleRunCeremony(): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  const ceremoniesPath = path.join(ctx.rootPath, '.squad', 'ceremonies.md');
  let ceremonies: string[] = ['Design Review', 'Retro', 'Standup', 'Sprint Planning'];

  if (fs.existsSync(ceremoniesPath)) {
    const content = fs.readFileSync(ceremoniesPath, 'utf-8');
    const headerMatches = content.match(/^##\s+(.+)$/gm);
    if (headerMatches && headerMatches.length > 0) {
      ceremonies = headerMatches.map((h) => h.replace(/^##\s+/, ''));
    }
  }

  const selected = await vscode.window.showQuickPick(ceremonies, {
    placeHolder: 'Select a ceremony to run',
  });

  if (!selected) {
    return;
  }

  vscode.window.showInformationMessage(`Squad: Starting ceremony "${selected}"`);
}
