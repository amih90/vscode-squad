import * as vscode from 'vscode';
import { squadRegistry } from '../core/squadRegistry';
import { statsEngine } from '../monitoring/statsEngine';

export async function handleShowStats(): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  const agents = [...ctx.agents.values()];
  const stats = statsEngine.getSquadStats(agents);

  const channel = vscode.window.createOutputChannel('Squad Statistics');
  channel.clear();

  channel.appendLine(`=== Squad Statistics: ${ctx.rootPath} ===`);
  channel.appendLine('');
  channel.appendLine(`Total Agents:     ${stats.totalAgents}`);
  channel.appendLine(`Active Agents:    ${stats.activeAgents}`);
  channel.appendLine(`Health Score:     ${stats.healthScore}/100`);
  channel.appendLine(`Total Tasks:      ${stats.totalTasks}`);
  channel.appendLine(`Completed Tasks:  ${stats.completedTasks}`);
  channel.appendLine(`Failed Tasks:     ${stats.failedTasks}`);
  channel.appendLine('');
  channel.appendLine('--- Per-Agent Breakdown ---');

  for (const agent of agents) {
    const agentStats = statsEngine.getAgentStats(agent.name);
    channel.appendLine('');
    channel.appendLine(`${agent.name} (${agent.role}) — ${agent.status}`);
    channel.appendLine(`  Tasks: ${agentStats.completedTasks}/${agentStats.totalTasks} completed, ${agentStats.failedTasks} failed`);
    channel.appendLine(`  Avg Duration: ${Math.round(agentStats.averageDuration)}ms`);
    channel.appendLine(`  Decisions: ${agentStats.decisionsCount} | Lines Changed: ${agentStats.linesChanged}`);
  }

  channel.show();
}
