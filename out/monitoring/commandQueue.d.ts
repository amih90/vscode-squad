import { CommandQueueItem } from '../core/types';
declare class CommandQueueManager {
    private queue;
    enqueue(agentName: string, command: string, args?: string[]): CommandQueueItem;
    markRunning(id: string): void;
    markCompleted(id: string, result?: string): void;
    markFailed(id: string, error?: string): void;
    getQueue(): CommandQueueItem[];
    getQueueForAgent(agentName: string): CommandQueueItem[];
    getPending(): CommandQueueItem[];
    clearCompleted(): void;
}
export declare const commandQueueManager: CommandQueueManager;
export {};
//# sourceMappingURL=commandQueue.d.ts.map