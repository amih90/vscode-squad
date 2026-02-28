"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsEngine = void 0;
function emptyStats() {
    return {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        inProgressTasks: 0,
        totalDurationMs: 0,
        linesChanged: 0,
        decisionsCount: 0,
        lastActiveAt: 0,
    };
}
function toPublic(name, s) {
    return {
        totalTasks: s.totalTasks,
        completedTasks: s.completedTasks,
        failedTasks: s.failedTasks,
        averageDuration: s.completedTasks > 0 ? s.totalDurationMs / s.completedTasks : 0,
        lastActiveAt: s.lastActiveAt,
        decisionsCount: s.decisionsCount,
        linesChanged: s.linesChanged,
    };
}
class StatsEngine {
    constructor() {
        this.agentStats = new Map();
    }
    getOrCreate(agentName) {
        let stats = this.agentStats.get(agentName);
        if (!stats) {
            stats = emptyStats();
            this.agentStats.set(agentName, stats);
        }
        return stats;
    }
    recordTaskStart(agentName) {
        const stats = this.getOrCreate(agentName);
        stats.totalTasks++;
        stats.inProgressTasks++;
        stats.lastActiveAt = Date.now();
    }
    recordTaskComplete(agentName, durationMs, linesChanged) {
        const stats = this.getOrCreate(agentName);
        stats.completedTasks++;
        stats.inProgressTasks = Math.max(0, stats.inProgressTasks - 1);
        stats.totalDurationMs += durationMs;
        stats.linesChanged += linesChanged ?? 0;
        stats.lastActiveAt = Date.now();
    }
    recordTaskFailure(agentName) {
        const stats = this.getOrCreate(agentName);
        stats.failedTasks++;
        stats.inProgressTasks = Math.max(0, stats.inProgressTasks - 1);
        stats.lastActiveAt = Date.now();
    }
    recordDecision(agentName) {
        const stats = this.getOrCreate(agentName);
        stats.decisionsCount++;
        stats.lastActiveAt = Date.now();
    }
    getAgentStats(agentName) {
        return toPublic(agentName, this.getOrCreate(agentName));
    }
    getSquadStats(agents) {
        let totalTasks = 0;
        let completedTasks = 0;
        let failedTasks = 0;
        let lastActivityAt = 0;
        const activeAgents = agents.filter((a) => a.status !== 'offline').length;
        for (const agent of agents) {
            const s = this.getOrCreate(agent.name);
            totalTasks += s.totalTasks;
            completedTasks += s.completedTasks;
            failedTasks += s.failedTasks;
            if (s.lastActiveAt > lastActivityAt) {
                lastActivityAt = s.lastActiveAt;
            }
        }
        return {
            totalAgents: agents.length,
            activeAgents,
            totalTasks,
            completedTasks,
            failedTasks,
            healthScore: this.computeHealthScore(agents),
            lastActivityAt,
        };
    }
    computeHealthScore(agents) {
        if (agents.length === 0) {
            return 0;
        }
        const now = Date.now();
        const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
        let utilizationScore = 0;
        let errorScore = 0;
        let freshnessScore = 0;
        let counted = 0;
        for (const agent of agents) {
            if (agent.status === 'offline') {
                continue;
            }
            counted++;
            // Utilization: active/working > idle
            utilizationScore += agent.status === 'active' || agent.status === 'working' ? 1 : 0.5;
            // Error rate: lower is better (derive from statistics)
            const totalForAgent = agent.statistics.completedTasks + agent.statistics.failedTasks;
            const agentErrorRate = totalForAgent > 0 ? agent.statistics.failedTasks / totalForAgent : 0;
            errorScore += 1 - Math.min(agentErrorRate, 1);
            // Freshness: recent activity is better
            const age = now - (agent.lastActivity ?? 0);
            freshnessScore += age < STALE_THRESHOLD_MS ? 1 : Math.max(0, 1 - age / (STALE_THRESHOLD_MS * 4));
        }
        if (counted === 0) {
            return 0;
        }
        const utilization = (utilizationScore / counted) * 40;
        const errors = (errorScore / counted) * 35;
        const freshness = (freshnessScore / counted) * 25;
        return Math.round(Math.min(100, Math.max(0, utilization + errors + freshness)));
    }
}
exports.statsEngine = new StatsEngine();
//# sourceMappingURL=statsEngine.js.map