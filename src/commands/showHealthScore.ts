import * as vscode from 'vscode';
import { squadRegistry } from '../core/squadRegistry';
import { statsEngine } from '../monitoring/statsEngine';

export async function handleShowHealthScore(): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  const agents = [...ctx.agents.values()];
  const stats = statsEngine.getSquadStats(agents);

  const lines = [
    `Health Score: ${stats.healthScore}/100`,
    `Agents: ${stats.activeAgents}/${stats.totalAgents} active`,
    `Tasks: ${stats.completedTasks} completed, ${stats.failedTasks} failed`,
  ];

  vscode.window.showInformationMessage(`Squad Health — ${lines.join(' | ')}`);
}
