import * as vscode from 'vscode';
import { logStore } from '../monitoring/logStore';
import type { LogEntry } from '../core/types';

const LOG_LEVELS: LogEntry['level'][] = ['debug', 'info', 'warn', 'error'];

export async function handleFilterLogs(): Promise<void> {
  const level = await vscode.window.showQuickPick(LOG_LEVELS, {
    placeHolder: 'Select log level to filter by',
  });

  if (!level) {
    return;
  }

  const entries = logStore.getEntries({ level });

  const channel = vscode.window.createOutputChannel('Squad Logs (Filtered)');
  channel.clear();

  if (entries.length === 0) {
    channel.appendLine(`No log entries at level "${level}".`);
  } else {
    channel.appendLine(`--- Showing ${entries.length} entries at level: ${level} ---`);
    for (const entry of entries) {
      const time = new Date(entry.timestamp).toISOString();
      channel.appendLine(`[${time}] [${entry.agentName}] ${entry.message}`);
    }
  }

  channel.show();
}
