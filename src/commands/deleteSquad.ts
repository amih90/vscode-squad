import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

export async function handleDeleteSquad(): Promise<void> {
  const all = squadRegistry.allContexts;
  if (all.length === 0) {
    vscode.window.showWarningMessage('No squads registered');
    return;
  }

  const items = all.map((ctx) => ({
    label: ctx.rootPath,
    description: ctx.rootPath,
    rootPath: ctx.rootPath,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select squad to delete',
  });

  if (!selected) {
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Delete .squad directory at ${selected.rootPath}? This cannot be undone.`,
    { modal: true },
    'Delete',
  );

  if (confirm !== 'Delete') {
    return;
  }

  squadRegistry.unregisterSquad(selected.rootPath);

  const squadDir = path.join(selected.rootPath, '.squad');
  if (fs.existsSync(squadDir)) {
    fs.rmSync(squadDir, { recursive: true, force: true });
  }

  vscode.window.showInformationMessage('Squad: Deleted .squad directory');
}
