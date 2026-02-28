import { RingBuffer } from '../core/ringBuffer';
import { LogEntry } from '../core/types';
import { eventBus } from '../core/eventBus';

let idCounter = 0;

function nextId(): string {
  return `log-${Date.now()}-${++idCounter}`;
}

interface LogFilter {
  agent?: string;
  level?: string;
  since?: number;
}

class LogStore {
  private buffer: RingBuffer<LogEntry>;

  constructor(capacity = 1000) {
    this.buffer = new RingBuffer<LogEntry>(capacity);
  }

  addEntry(entry: Omit<LogEntry, 'id'>): LogEntry {
    const full: LogEntry = { ...entry, id: nextId() };
    this.buffer.push(full);
    eventBus.emit('log-entry', { entry: full });
    return full;
  }

  getEntries(filter?: LogFilter): LogEntry[] {
    let entries = this.buffer.toArray();
    if (!filter) {
      return entries;
    }
    if (filter.agent) {
      entries = entries.filter((e) => e.agentName === filter.agent);
    }
    if (filter.level) {
      entries = entries.filter((e) => e.level === filter.level);
    }
    if (filter.since !== undefined) {
      entries = entries.filter((e) => e.timestamp >= filter.since!);
    }
    return entries;
  }

  getEntriesForAgent(agentName: string): LogEntry[] {
    return this.getEntries({ agent: agentName });
  }

  clear(): void {
    this.buffer.clear();
  }
}

export const logStore = new LogStore();
