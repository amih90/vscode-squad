import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';
import { generateCharter } from '../templates/squadTemplates';

export async function handleEditCharter(agentNameArg?: string): Promise<void> {
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
      placeHolder: 'Select an agent to edit charter',
    });
  }

  if (!agentName) {
    return;
  }

  const agent = ctx.agents.get(agentName);
  const slug = agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const agentDir = path.join(ctx.squadDir, 'agents', slug);
  const charterPath = path.join(agentDir, 'charter.md');

  // Scaffold with rich charter if missing
  if (!fs.existsSync(charterPath)) {
    fs.mkdirSync(agentDir, { recursive: true });
    const role = agent?.role ?? 'Team Member';
    const projectName = path.basename(ctx.rootPath);
    const charter = generateCharter(agentName, role, projectName);
    fs.writeFileSync(charterPath, charter, 'utf-8');
  }

  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(charterPath));
  await vscode.window.showTextDocument(doc, { preview: false });
}
