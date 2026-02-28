import { LogEntry } from '../core/types';
interface LogFilter {
    agent?: string;
    level?: string;
    since?: number;
}
declare class LogStore {
    private buffer;
    constructor(capacity?: number);
    addEntry(entry: Omit<LogEntry, 'id'>): LogEntry;
    getEntries(filter?: LogFilter): LogEntry[];
    getEntriesForAgent(agentName: string): LogEntry[];
    clear(): void;
}
export declare const logStore: LogStore;
export {};
//# sourceMappingURL=logStore.d.ts.map