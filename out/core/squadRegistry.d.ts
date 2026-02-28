import * as vscode from 'vscode';
import type { AgentRuntime, CommandQueueItem, LogEntry, SquadStatistics } from './types';
import { RingBuffer } from './ringBuffer';
import type { TeamState } from '../team/teamState';
export interface SquadContext {
    rootPath: string;
    squadDir: string;
    squadName: string;
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
    registerSquad(squadDir: string, workspaceRoot?: string): Promise<void>;
    unregisterSquad(squadDir: string): void;
    setActiveSquad(squadDir: string): void;
    getContext(squadDir: string): SquadContext | undefined;
    scanWorkspaceFolders(): Promise<void>;
    dispose(): void;
}
export declare const squadRegistry: SquadRegistry;
export {};
//# sourceMappingURL=squadRegistry.d.ts.map