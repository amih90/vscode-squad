import * as vscode from 'vscode';
import { squadRegistry } from '../core/squadRegistry';

export async function handleSwitchSquad(squadPath?: string): Promise<void> {
  const all = squadRegistry.allContexts;
  if (all.length === 0) {
    vscode.window.showWarningMessage('No squads registered');
    return;
  }

  if (!squadPath) {
    const items = all.map((ctx) => ({
      label: ctx.rootPath,
      description: ctx.rootPath,
      rootPath: ctx.rootPath,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a squad to activate',
    });

    if (!selected) {
      return;
    }

    squadPath = selected.rootPath;
  }

  squadRegistry.setActiveSquad(squadPath);
  vscode.window.showInformationMessage(`Squad: Switched to ${squadPath}`);
}
