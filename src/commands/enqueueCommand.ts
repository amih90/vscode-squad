import * as vscode from 'vscode';
import { squadRegistry } from '../core/squadRegistry';
import { commandQueueManager } from '../monitoring/commandQueue';

export async function handleEnqueueCommand(): Promise<void> {
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

  const agentName = await vscode.window.showQuickPick(names, {
    placeHolder: 'Select target agent',
  });

  if (!agentName) {
    return;
  }

  const command = await vscode.window.showInputBox({
    prompt: 'Enter command to enqueue',
    placeHolder: 'e.g., review src/index.ts',
  });

  if (!command) {
    return;
  }

  const item = commandQueueManager.enqueue(agentName, command);
  vscode.window.showInformationMessage(`Squad: Command queued for ${agentName} (${item.id})`);
}
