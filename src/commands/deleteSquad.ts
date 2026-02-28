import * as vscode from 'vscode';
import * as fs from 'fs';
import { squadRegistry } from '../core/squadRegistry';

export async function handleDeleteSquad(): Promise<void> {
  const all = squadRegistry.allContexts;
  if (all.length === 0) {
    vscode.window.showWarningMessage('No squads registered');
    return;
  }

  const items = all.map((ctx) => ({
    label: ctx.squadName,
    description: ctx.squadDir,
    squadDir: ctx.squadDir,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select squad to delete',
  });

  if (!selected) {
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Delete squad "${selected.label}" at ${selected.squadDir}? This cannot be undone.`,
    { modal: true },
    'Delete',
  );

  if (confirm !== 'Delete') {
    return;
  }

  squadRegistry.unregisterSquad(selected.squadDir);

  if (fs.existsSync(selected.squadDir)) {
    fs.rmSync(selected.squadDir, { recursive: true, force: true });
  }

  vscode.window.showInformationMessage(`Squad: Deleted "${selected.label}"`);
}
