import * as vscode from 'vscode';
import { logStore } from '../monitoring/logStore';
import { commandQueueManager } from '../monitoring/commandQueue';
import type { LogEntry, CommandQueueItem } from '../core/types';

const MAX_ITEMS = 50;
const MAX_LABEL_LENGTH = 80;

export class ActivityProvider implements vscode.TreeDataProvider<ActivityItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ActivityItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: ActivityItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ActivityItem): ActivityItem[] {
    if (element) {
      return [];
    }

    const logItems = logStore.getEntries().map(logEntryToItem);
    const cmdItems = commandQueueManager.getQueue().map(commandToItem);

    const merged = [...logItems, ...cmdItems]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_ITEMS);

    return merged;
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) { return text; }
  return text.slice(0, max - 1) + '…';
}

function logLevelIcon(level: LogEntry['level']): string {
  switch (level) {
    case 'error': return 'error';
    case 'warn': return 'warning';
    case 'debug': return 'debug-alt';
    case 'info':
    default: return 'info';
  }
}

function commandStatusIcon(status: CommandQueueItem['status']): string {
  switch (status) {
    case 'queued': return 'clock';
    case 'running': return 'sync~spin';
    case 'completed': return 'check';
    case 'failed': return 'x';
  }
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

function logEntryToItem(entry: LogEntry): ActivityItem {
  const label = truncate(entry.message, MAX_LABEL_LENGTH);
  const description = entry.agentName;
  const tooltip = `[${formatTimestamp(entry.timestamp)}] ${entry.agentName}: ${entry.message}`;
  const iconId = logLevelIcon(entry.level);
  return new ActivityItem(label, description, tooltip, iconId, entry.timestamp);
}

function commandToItem(item: CommandQueueItem): ActivityItem {
  const label = truncate(item.command, MAX_LABEL_LENGTH);
  const description = `${item.agentName} · ${item.status}`;
  const tooltip = `[${formatTimestamp(item.createdAt)}] ${item.agentName}: ${item.command} (${item.status})`;
  const iconId = commandStatusIcon(item.status);
  return new ActivityItem(label, description, tooltip, iconId, item.createdAt);
}

export class ActivityItem extends vscode.TreeItem {
  constructor(
    label: string,
    description: string,
    tooltip: string,
    iconId: string,
    public readonly timestamp: number,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = description;
    this.tooltip = tooltip;
    this.iconPath = new vscode.ThemeIcon(iconId);
  }
}
