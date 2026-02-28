import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

export async function handleOpenCeremonies(): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  const ceremoniesPath = path.join(ctx.squadDir, 'ceremonies.md');
  if (!fs.existsSync(ceremoniesPath)) {
    fs.writeFileSync(ceremoniesPath, `# Ceremonies

## Standup
- **Cadence:** Daily (or per-session)
- **Format:** Each agent reports status, yesterday, today, blockers

## Retro
- **Cadence:** End of sprint/milestone
- **Format:** What went well, what to improve, action items
`, 'utf-8');
  }

  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(ceremoniesPath));
  await vscode.window.showTextDocument(doc, { preview: false });
}
