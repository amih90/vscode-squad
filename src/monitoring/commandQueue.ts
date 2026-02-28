import { CommandQueueItem } from '../core/types';
import { eventBus } from '../core/eventBus';

let idCounter = 0;

function nextId(): string {
  return `cmd-${Date.now()}-${++idCounter}`;
}

class CommandQueueManager {
  private queue: CommandQueueItem[] = [];

  enqueue(agentName: string, command: string, args?: string[]): CommandQueueItem {
    const item: CommandQueueItem = {
      id: nextId(),
      agentName,
      command,
      args: args ?? [],
      status: 'queued',
      createdAt: Date.now(),
    };
    this.queue.push(item);
    eventBus.emit('command-queued', { item });
    return item;
  }

  markRunning(id: string): void {
    const item = this.queue.find((i) => i.id === id);
    if (item) {
      item.status = 'running';
      item.startedAt = Date.now();
    }
  }

  markCompleted(id: string, result?: string): void {
    const item = this.queue.find((i) => i.id === id);
    if (item) {
      item.status = 'completed';
      item.completedAt = Date.now();
      item.result = result;
      eventBus.emit('command-completed', { id, result: 'success' });
    }
  }

  markFailed(id: string, error?: string): void {
    const item = this.queue.find((i) => i.id === id);
    if (item) {
      item.status = 'failed';
      item.completedAt = Date.now();
      item.error = error;
      eventBus.emit('command-completed', { id, result: 'failure' });
    }
  }

  getQueue(): CommandQueueItem[] {
    return [...this.queue];
  }

  getQueueForAgent(agentName: string): CommandQueueItem[] {
    return this.queue.filter((i) => i.agentName === agentName);
  }

  getPending(): CommandQueueItem[] {
    return this.queue.filter((i) => i.status === 'queued' || i.status === 'running');
  }

  clearCompleted(): void {
    this.queue = this.queue.filter((i) => i.status !== 'completed');
  }
}

export const commandQueueManager = new CommandQueueManager();
