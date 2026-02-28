import * as vscode from 'vscode';
import { commandQueueManager } from '../monitoring/commandQueue';

export async function handleViewQueue(): Promise<void> {
  const queue = commandQueueManager.getQueue();

  const channel = vscode.window.createOutputChannel('Squad Command Queue');
  channel.clear();

  if (queue.length === 0) {
    channel.appendLine('Command queue is empty.');
  } else {
    channel.appendLine(`--- ${queue.length} command(s) in queue ---`);
    for (const item of queue) {
      const time = new Date(item.createdAt).toISOString();
      channel.appendLine(`[${item.status.toUpperCase()}] ${item.id} | ${item.agentName} | ${item.command} | ${time}`);
      if (item.error) {
        channel.appendLine(`  Error: ${item.error}`);
      }
      if (item.result) {
        channel.appendLine(`  Result: ${item.result}`);
      }
    }
  }

  channel.show();
}
