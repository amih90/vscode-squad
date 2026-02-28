import { AgentStatistics, SquadStatistics, AgentRuntime } from '../core/types';
declare class StatsEngine {
    private agentStats;
    private getOrCreate;
    recordTaskStart(agentName: string): void;
    recordTaskComplete(agentName: string, durationMs: number, linesChanged?: number): void;
    recordTaskFailure(agentName: string): void;
    recordDecision(agentName: string): void;
    getAgentStats(agentName: string): AgentStatistics;
    getSquadStats(agents: AgentRuntime[]): SquadStatistics;
    computeHealthScore(agents: AgentRuntime[]): number;
}
export declare const statsEngine: StatsEngine;
export {};
//# sourceMappingURL=statsEngine.d.ts.map