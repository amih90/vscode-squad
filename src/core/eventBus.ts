import type {
  AgentStatus,
  CommandQueueItem,
  LogEntry,
  SquadStatistics,
} from './types';
import type { TeamState } from '../team/teamState';

export interface SquadEvents {
  'team-changed': { squadPath: string; state: TeamState };
  'agent-status': { agentName: string; status: AgentStatus };
  'log-entry': { entry: LogEntry };
  'command-queued': { item: CommandQueueItem };
  'command-completed': { id: string; result: 'success' | 'failure' };
  'squad-activated': { squadPath: string };
  'squad-deactivated': { squadPath: string };
  'stats-updated': { agentName: string; stats: SquadStatistics };
}

type EventCallback<T> = (data: T) => void;

class EventBus {
  private listeners = new Map<string, Set<EventCallback<unknown>>>();

  on<K extends keyof SquadEvents>(
    event: K,
    callback: EventCallback<SquadEvents[K]>,
  ): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(callback as EventCallback<unknown>);
  }

  off<K extends keyof SquadEvents>(
    event: K,
    callback: EventCallback<SquadEvents[K]>,
  ): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback as EventCallback<unknown>);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit<K extends keyof SquadEvents>(event: K, data: SquadEvents[K]): void {
    const set = this.listeners.get(event);
    if (set) {
      for (const callback of set) {
        callback(data);
      }
    }
  }

  dispose(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
