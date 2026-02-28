import * as vscode from 'vscode';
import { squadRegistry } from '../core/squadRegistry';
import { logStore } from '../monitoring/logStore';

export async function handleShowLogs(): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  const names = [...ctx.agents.keys()];
  const selected = await vscode.window.showQuickPick(['(All agents)', ...names], {
    placeHolder: 'Show logs for which agent?',
  });

  if (!selected) {
    return;
  }

  const agent = selected === '(All agents)' ? undefined : selected;
  const entries = logStore.getEntries({ agent });

  const channel = vscode.window.createOutputChannel('Squad Logs');
  channel.clear();

  if (entries.length === 0) {
    channel.appendLine('No log entries found.');
  } else {
    for (const entry of entries) {
      const time = new Date(entry.timestamp).toISOString();
      channel.appendLine(`[${time}] [${entry.level.toUpperCase()}] [${entry.agentName}] ${entry.message}`);
    }
  }

  channel.show();
}
