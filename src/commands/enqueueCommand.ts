import * as vscode from 'vscode';
import { squadRegistry } from '../core/squadRegistry';
import { commandQueueManager } from '../monitoring/commandQueue';
import { copilotExecutor } from '../monitoring/copilotExecutor';

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

  const allOption = '$(organization) Entire Squad';
  const agentName = await vscode.window.showQuickPick([allOption, ...names], {
    placeHolder: 'Select target agent or entire squad',
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

  if (agentName === allOption) {
    const items = names.map(name => commandQueueManager.enqueue(name, command));
    vscode.window.showInformationMessage(`Squad: Command queued for all ${items.length} agents`);
    
    // Execute via Copilot
    await copilotExecutor.executeSquadTask(command, items.map(i => i.id));
  } else {
    const item = commandQueueManager.enqueue(agentName, command);
    vscode.window.showInformationMessage(`Squad: Command queued for ${agentName} (${item.id})`);
    
    // Execute via Copilot
    await copilotExecutor.executeTask(agentName, command, item.id);
  }
}
