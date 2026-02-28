import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import type {
  AgentRuntime,
  AgentStatistics,
  CommandQueueItem,
  LogEntry,
  SquadStatistics,
} from './types';
import { eventBus } from './eventBus';
import { RingBuffer } from './ringBuffer';
import type { TeamState } from '../team/teamState';
import { parseTeamFile } from '../team/parser';

export interface SquadContext {
  rootPath: string;
  teamState: TeamState;
  agents: Map<string, AgentRuntime>;
  logBuffer: RingBuffer<LogEntry>;
  commandQueue: CommandQueueItem[];
  statistics: SquadStatistics;
  watcher: vscode.Disposable;
}

function emptyStatistics(): SquadStatistics {
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

function emptyAgentStatistics(): AgentStatistics {
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

function buildAgentMap(teamState: TeamState): Map<string, AgentRuntime> {
  const agents = new Map<string, AgentRuntime>();
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
  private contexts = new Map<string, SquadContext>();
  private _activeSquadPath: string | undefined;

  get activeContext(): SquadContext | undefined {
    if (!this._activeSquadPath) {
      return undefined;
    }
    return this.contexts.get(this._activeSquadPath);
  }

  get allContexts(): SquadContext[] {
    return [...this.contexts.values()];
  }

  get activeSquadPath(): string | undefined {
    return this._activeSquadPath;
  }

  async registerSquad(rootPath: string): Promise<void> {
    const teamFilePath = path.join(rootPath, '.squad', 'team.md');
    if (!fs.existsSync(teamFilePath)) {
      return;
    }

    const content = fs.readFileSync(teamFilePath, 'utf-8');
    const teamState = parseTeamFile(content, teamFilePath);
    const agents = buildAgentMap(teamState);

    const stats = emptyStatistics();
    stats.totalAgents = agents.size;

    const teamFileUri = vscode.Uri.file(teamFilePath);
    const fileWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(teamFileUri, ''),
    );

    const onTeamFileChange = () => {
      const updated = fs.readFileSync(teamFilePath, 'utf-8');
      const newState = parseTeamFile(updated, teamFilePath);
      const ctx = this.contexts.get(rootPath);
      if (ctx) {
        ctx.teamState = newState;
        ctx.agents = buildAgentMap(newState);
        ctx.statistics.totalAgents = ctx.agents.size;
        eventBus.emit('team-changed', { squadPath: rootPath, state: newState });
      }
    };

    fileWatcher.onDidChange(onTeamFileChange);
    fileWatcher.onDidCreate(onTeamFileChange);

    const context: SquadContext = {
      rootPath,
      teamState,
      agents,
      logBuffer: new RingBuffer<LogEntry>(1000),
      commandQueue: [],
      statistics: stats,
      watcher: fileWatcher,
    };

    this.contexts.set(rootPath, context);

    if (!this._activeSquadPath) {
      this._activeSquadPath = rootPath;
    }

    eventBus.emit('squad-activated', { squadPath: rootPath });
  }

  unregisterSquad(rootPath: string): void {
    const context = this.contexts.get(rootPath);
    if (context) {
      context.watcher.dispose();
      this.contexts.delete(rootPath);
      eventBus.emit('squad-deactivated', { squadPath: rootPath });

      if (this._activeSquadPath === rootPath) {
        const remaining = this.contexts.keys().next();
        this._activeSquadPath = remaining.done ? undefined : remaining.value;
      }
    }
  }

  setActiveSquad(rootPath: string): void {
    if (this.contexts.has(rootPath)) {
      this._activeSquadPath = rootPath;
      eventBus.emit('squad-activated', { squadPath: rootPath });
    }
  }

  getContext(rootPath: string): SquadContext | undefined {
    return this.contexts.get(rootPath);
  }

  async scanWorkspaceFolders(): Promise<void> {
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

  dispose(): void {
    for (const context of this.contexts.values()) {
      context.watcher.dispose();
    }
    this.contexts.clear();
    this._activeSquadPath = undefined;
  }
}

export const squadRegistry = new SquadRegistry();
