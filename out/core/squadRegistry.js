"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.squadRegistry = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const eventBus_1 = require("./eventBus");
const ringBuffer_1 = require("./ringBuffer");
const parser_1 = require("../team/parser");
function emptyStatistics() {
    return {
        totalAgents: 0,
        activeAgents: 0,
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        healthScore: 100,
        lastActivityAt: 0,
    };
}
function emptyAgentStatistics() {
    return {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageDuration: 0,
        lastActiveAt: 0,
        decisionsCount: 0,
        linesChanged: 0,
    };
}
function buildAgentMap(teamState) {
    const agents = new Map();
    for (const member of teamState.members) {
        agents.set(member.name, {
            name: member.name,
            role: member.role,
            emoji: '👤',
            charter: member.charter,
            status: 'idle',
            statistics: emptyAgentStatistics(),
        });
    }
    if (teamState.coordinator) {
        agents.set(teamState.coordinator.name, {
            name: teamState.coordinator.name,
            role: teamState.coordinator.role,
            emoji: '🏗️',
            charter: teamState.coordinator.charter,
            status: 'idle',
            statistics: emptyAgentStatistics(),
        });
    }
    if (teamState.codingAgent) {
        agents.set(teamState.codingAgent.name, {
            name: teamState.codingAgent.name,
            role: teamState.codingAgent.role,
            emoji: '🤖',
            charter: teamState.codingAgent.charter,
            status: 'idle',
            statistics: emptyAgentStatistics(),
        });
    }
    return agents;
}
class SquadRegistry {
    constructor() {
        this.contexts = new Map();
    }
    get activeContext() {
        if (!this._activeSquadPath) {
            return undefined;
        }
        return this.contexts.get(this._activeSquadPath);
    }
    get allContexts() {
        return [...this.contexts.values()];
    }
    get activeSquadPath() {
        return this._activeSquadPath;
    }
    async registerSquad(rootPath) {
        const teamFilePath = path.join(rootPath, '.squad', 'team.md');
        if (!fs.existsSync(teamFilePath)) {
            return;
        }
        const content = fs.readFileSync(teamFilePath, 'utf-8');
        const teamState = (0, parser_1.parseTeamFile)(content, teamFilePath);
        const agents = buildAgentMap(teamState);
        const stats = emptyStatistics();
        stats.totalAgents = agents.size;
        const teamFileUri = vscode.Uri.file(teamFilePath);
        const fileWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(teamFileUri, ''));
        const onTeamFileChange = () => {
            const updated = fs.readFileSync(teamFilePath, 'utf-8');
            const newState = (0, parser_1.parseTeamFile)(updated, teamFilePath);
            const ctx = this.contexts.get(rootPath);
            if (ctx) {
                ctx.teamState = newState;
                ctx.agents = buildAgentMap(newState);
                ctx.statistics.totalAgents = ctx.agents.size;
                eventBus_1.eventBus.emit('team-changed', { squadPath: rootPath, state: newState });
            }
        };
        fileWatcher.onDidChange(onTeamFileChange);
        fileWatcher.onDidCreate(onTeamFileChange);
        const context = {
            rootPath,
            teamState,
            agents,
            logBuffer: new ringBuffer_1.RingBuffer(1000),
            commandQueue: [],
            statistics: stats,
            watcher: fileWatcher,
        };
        this.contexts.set(rootPath, context);
        if (!this._activeSquadPath) {
            this._activeSquadPath = rootPath;
        }
        eventBus_1.eventBus.emit('squad-activated', { squadPath: rootPath });
    }
    unregisterSquad(rootPath) {
        const context = this.contexts.get(rootPath);
        if (context) {
            context.watcher.dispose();
            this.contexts.delete(rootPath);
            eventBus_1.eventBus.emit('squad-deactivated', { squadPath: rootPath });
            if (this._activeSquadPath === rootPath) {
                const remaining = this.contexts.keys().next();
                this._activeSquadPath = remaining.done ? undefined : remaining.value;
            }
        }
    }
    setActiveSquad(rootPath) {
        if (this.contexts.has(rootPath)) {
            this._activeSquadPath = rootPath;
            eventBus_1.eventBus.emit('squad-activated', { squadPath: rootPath });
        }
    }
    getContext(rootPath) {
        return this.contexts.get(rootPath);
    }
    async scanWorkspaceFolders() {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            return;
        }
        for (const folder of folders) {
            const rootPath = folder.uri.fsPath;
            if (!this.contexts.has(rootPath)) {
                await this.registerSquad(rootPath);
            }
        }
    }
    dispose() {
        for (const context of this.contexts.values()) {
            context.watcher.dispose();
        }
        this.contexts.clear();
        this._activeSquadPath = undefined;
    }
}
exports.squadRegistry = new SquadRegistry();
//# sourceMappingURL=squadRegistry.js.map