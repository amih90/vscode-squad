import * as vscode from 'vscode';
import type { AgentRuntime, CommandQueueItem, LogEntry, SquadStatistics } from './types';
import { RingBuffer } from './ringBuffer';
import type { TeamState } from '../team/teamState';
export interface SquadContext {
    rootPath: string;
    teamState: TeamState;
    agents: Map<string, AgentRuntime>;
    logBuffer: RingBuffer<LogEntry>;
    commandQueue: CommandQueueItem[];
    statistics: SquadStatistics;
    watcher: vscode.Disposable;
}
declare class SquadRegistry {
    private contexts;
    private _activeSquadPath;
    get activeContext(): SquadContext | undefined;
    get allContexts(): SquadContext[];
    get activeSquadPath(): string | undefined;
    registerSquad(rootPath: string): Promise<void>;
    unregisterSquad(rootPath: string): void;
    setActiveSquad(rootPath: string): void;
    getContext(rootPath: string): SquadContext | undefined;
    scanWorkspaceFolders(): Promise<void>;
    dispose(): void;
}
export declare const squadRegistry: SquadRegistry;
export {};
//# sourceMappingURL=squadRegistry.d.ts.map