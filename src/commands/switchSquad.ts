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
      label: ctx.squadName,
      description: ctx.squadDir,
      squadDir: ctx.squadDir,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a squad to activate',
    });

    if (!selected) {
      return;
    }

    squadPath = selected.squadDir;
  }

  squadRegistry.setActiveSquad(squadPath);
  const ctx = squadRegistry.getContext(squadPath);
  vscode.window.showInformationMessage(`Squad: Switched to "${ctx?.squadName ?? squadPath}"`);
}
