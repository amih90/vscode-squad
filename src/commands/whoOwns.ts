import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

export async function handleWhoOwns(): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  // Determine target file
  let targetPath = vscode.window.activeTextEditor?.document.uri.fsPath;
  if (!targetPath) {
    const input = await vscode.window.showInputBox({
      prompt: 'Enter file path (relative to workspace)',
      placeHolder: 'e.g., src/server/index.ts',
    });
    if (!input) { return; }
    const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!folder) { return; }
    targetPath = path.join(folder, input);
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';
  const relativePath = path.relative(workspaceRoot, targetPath);

  // Parse charters for ownership patterns
  const agentsDir = path.join(ctx.squadDir, 'agents');
  const owners: { agent: string; pattern: string }[] = [];

  if (fs.existsSync(agentsDir)) {
    for (const entry of fs.readdirSync(agentsDir)) {
      const charterPath = path.join(agentsDir, entry, 'charter.md');
      if (!fs.existsSync(charterPath)) { continue; }

      const content = fs.readFileSync(charterPath, 'utf-8');
      const ownedSection = content.match(/## Owned Files\n([\s\S]*?)(?=\n##|$)/);
      if (!ownedSection) { continue; }

      const patterns = ownedSection[1]
        .split('\n')
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(line => line.length > 0 && !line.startsWith('('));

      for (const pattern of patterns) {
        if (matchGlobSimple(relativePath, pattern)) {
          // Find the agent name from the roster
          const agentName = [...ctx.agents.entries()]
            .find(([_, a]) => a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === entry)?.[0]
            ?? entry;
          owners.push({ agent: agentName, pattern });
        }
      }
    }
  }

  if (owners.length === 0) {
    vscode.window.showInformationMessage(`No agent owns "${relativePath}". Consider defining ownership in agent charters.`);
  } else {
    const ownerList = owners.map(o => `${o.agent} (${o.pattern})`).join(', ');
    const pick = await vscode.window.showInformationMessage(
      `"${relativePath}" is owned by: ${ownerList}`,
      'View Charter'
    );
    if (pick === 'View Charter') {
      vscode.commands.executeCommand('squad.editCharter', owners[0].agent);
    }
  }
}

/** Simple glob matching for common patterns like src/server/** */
function matchGlobSimple(filePath: string, pattern: string): boolean {
  // Normalize
  const normalizedPath = filePath.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  // Convert simple glob to regex
  const regexStr = normalizedPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')  // escape regex special chars (except * and ?)
    .replace(/\*\*/g, '{{GLOBSTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(/\{\{GLOBSTAR\}\}/g, '.*');

  return new RegExp(`^${regexStr}$`).test(normalizedPath);
}
