import * as vscode from 'vscode';
import { SQUAD_TEMPLATES } from '../templates/squadTemplates';

export async function handleBrowseTemplates(): Promise<void> {
  const items = SQUAD_TEMPLATES.map(t => ({
    label: t.label,
    description: `${t.agents.length} agents`,
    detail: t.description,
    id: t.id,
  }));

  const pick = await vscode.window.showQuickPick(items, {
    placeHolder: 'Browse squad templates',
    matchOnDetail: true,
  });

  if (pick) {
    const action = await vscode.window.showInformationMessage(
      `Template: ${pick.label} — ${pick.detail}`,
      'Create Squad with This Template',
      'Cancel'
    );
    if (action === 'Create Squad with This Template') {
      vscode.commands.executeCommand('squad.createSquad');
    }
  }
}
