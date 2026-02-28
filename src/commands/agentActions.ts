import * as vscode from 'vscode';
import { squadRegistry } from '../core/squadRegistry';

export async function handleAgentActions(agentName?: string): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  if (!agentName) {
    const names = [...ctx.agents.keys()];
    if (names.length === 0) {
      vscode.window.showWarningMessage('No agents in squad');
      return;
    }
    agentName = await vscode.window.showQuickPick(names, {
      placeHolder: 'Select agent',
    });
    if (!agentName) { return; }
  }

  const agent = ctx.agents.get(agentName);
  if (!agent) {
    vscode.window.showWarningMessage(`Agent "${agentName}" not found`);
    return;
  }

  const actions = [
    { label: '$(eye) View Details', command: 'squad.openAgentDetail', args: [agentName] },
    { label: '$(edit) Edit Charter', command: 'squad.editCharter', args: [agentName] },
    { label: '$(history) View History', command: 'squad.viewHistory', args: [agentName] },
    { label: '$(terminal) Send Command', command: 'squad.enqueueCommand', args: [agentName] },
    { label: '$(circle-filled) Set Status', command: 'squad.setAgentStatus', args: [] },
    { label: '$(person-delete) Remove from Squad', command: 'squad.removeMember', args: [] },
  ];

  const pick = await vscode.window.showQuickPick(
    actions.map(a => ({ label: a.label, description: `${agent!.role} · ${agent!.status}` })),
    { placeHolder: `Actions for ${agentName}` }
  );
  if (!pick) { return; }

  const action = actions.find(a => a.label === pick.label);
  if (action) {
    vscode.commands.executeCommand(action.command, ...action.args);
  }
}
