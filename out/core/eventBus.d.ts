import type { AgentStatus, CommandQueueItem, LogEntry, SquadStatistics } from './types';
import type { TeamState } from '../team/teamState';
export interface SquadEvents {
    'team-changed': {
        squadPath: string;
        state: TeamState;
    };
    'agent-status': {
        agentName: string;
        status: AgentStatus;
    };
    'log-entry': {
        entry: LogEntry;
    };
    'command-queued': {
        item: CommandQueueItem;
    };
    'command-completed': {
        id: string;
        result: 'success' | 'failure';
    };
    'squad-activated': {
        squadPath: string;
    };
    'squad-deactivated': {
        squadPath: string;
    };
    'stats-updated': {
        agentName: string;
        stats: SquadStatistics;
    };
}
type EventCallback<T> = (data: T) => void;
declare class EventBus {
    private listeners;
    on<K extends keyof SquadEvents>(event: K, callback: EventCallback<SquadEvents[K]>): void;
    off<K extends keyof SquadEvents>(event: K, callback: EventCallback<SquadEvents[K]>): void;
    emit<K extends keyof SquadEvents>(event: K, data: SquadEvents[K]): void;
    dispose(): void;
}
export declare const eventBus: EventBus;
export {};
//# sourceMappingURL=eventBus.d.ts.map