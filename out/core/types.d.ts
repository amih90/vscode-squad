export type AgentStatus = 'active' | 'idle' | 'working' | 'error' | 'offline';
export interface LogEntry {
    id: string;
    timestamp: number;
    agentName: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    metadata?: Record<string, unknown>;
}
export interface CommandQueueItem {
    id: string;
    agentName: string;
    command: string;
    args?: string[];
    status: 'queued' | 'running' | 'completed' | 'failed';
    createdAt: number;
    startedAt?: number;
    completedAt?: number;
    result?: string;
    error?: string;
}
export interface AgentStatistics {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageDuration: number;
    lastActiveAt: number;
    decisionsCount: number;
    linesChanged: number;
}
export interface SquadStatistics {
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    healthScore: number;
    lastActivityAt: number;
}
export interface DecisionEntry {
    id: string;
    timestamp: number;
    agentName: string;
    title: string;
    content: string;
    tags: string[];
}
export type WebviewToHostMessage = {
    type: 'ready';
} | {
    type: 'request-state';
} | {
    type: 'run-command';
    command: string;
    args?: unknown[];
} | {
    type: 'filter-logs';
    agent?: string;
    level?: string;
} | {
    type: 'select-agent';
    name: string;
} | {
    type: 'clear-logs';
} | {
    type: 'enqueue-command';
    agent: string;
    command: string;
} | {
    type: 'agent-selected';
    name: string | null;
};
export type HostToWebviewMessage = {
    type: 'state-update';
    data: DashboardState;
} | {
    type: 'log-entry';
    entry: LogEntry;
} | {
    type: 'agent-status';
    name: string;
    status: AgentStatus;
} | {
    type: 'stats-update';
    stats: SquadStatistics;
} | {
    type: 'theme-changed';
    kind: 'light' | 'dark' | 'highContrast';
} | {
    type: 'command-update';
    item: CommandQueueItem;
};
export interface DashboardState {
    squadName: string;
    squadPath: string;
    agents: AgentRuntime[];
    logs: LogEntry[];
    commandQueue: CommandQueueItem[];
    statistics: SquadStatistics;
}
export interface AgentRuntime {
    name: string;
    role: string;
    emoji: string;
    charter?: string;
    status: AgentStatus;
    currentTask?: string;
    lastOutput?: string;
    lastActivity?: number;
    statistics: AgentStatistics;
    branchName?: string;
}
//# sourceMappingURL=types.d.ts.map