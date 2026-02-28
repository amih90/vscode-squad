import * as vscode from 'vscode';
import { squadRegistry } from '../core/squadRegistry';
import { commandQueueManager } from './commandQueue';
import { eventBus } from '../core/eventBus';
import type { AgentRuntime } from '../core/types';

/**
 * Executes queued commands by sending them to GitHub Copilot.
 * Builds prompts with agent charter context.
 */
export class CopilotExecutor {
  /**
   * Execute a task for a specific agent via Copilot
   */
  async executeTask(
    agentName: string,
    task: string,
    queueItemId?: string
  ): Promise<void> {
    const ctx = squadRegistry.activeContext;
    if (!ctx) {
      throw new Error('No active squad');
    }

    const agent = ctx.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    // Mark queue item as running
    if (queueItemId) {
      commandQueueManager.markRunning(queueItemId);
    }

    // Update agent status to working
    eventBus.emit('agent-status', { agentName, status: 'working' });

    // Build the prompt with agent context
    const prompt = this.buildPrompt(agentName, agent, task);

    // Send to Copilot
    await this.sendToCopilot(prompt, agentName);
  }

  /**
   * Execute a task for the entire squad
   */
  async executeSquadTask(task: string, queueItemIds: string[]): Promise<void> {
    const ctx = squadRegistry.activeContext;
    if (!ctx) {
      throw new Error('No active squad');
    }

    const agents = Array.from(ctx.agents.entries());
    const agentSummary = agents
      .map(([name, agent]) => `- **${name}** (${agent.role})`)
      .join('\n');

    const prompt = `## Squad Task

You are coordinating a squad of ${agents.length} AI agents for this task.

### Squad Members:
${agentSummary}

### Task:
${task}

### Instructions:
1. Analyze the task and determine which agent(s) should handle it based on their roles
2. Execute the task, working within the scope of the appropriate agent's responsibilities
3. If the task spans multiple agents, break it down and handle each part according to the relevant agent's charter
4. Report progress: \`@squad /progress @AgentName <message>\`
5. When each agent finishes: \`@squad /complete @AgentName success|failure <summary>\`

Begin execution.`;

    // Mark all queue items as running
    queueItemIds.forEach(id => commandQueueManager.markRunning(id));

    // Update all agents to working
    agents.forEach(([name]) => {
      eventBus.emit('agent-status', { agentName: name, status: 'working' });
    });

    await this.sendToCopilot(prompt, 'Squad');
  }

  /**
   * Build a prompt with the agent's charter context
   */
  private buildPrompt(
    agentName: string,
    agent: AgentRuntime,
    task: string
  ): string {
    const charterSection = agent.charter
      ? `### Your Charter:\n${agent.charter}`
      : '';

    return `## Agent Task Assignment

You are acting as **${agentName}**, a ${agent.role} agent.

${charterSection}

### Your Task:
${task}

### Instructions:
1. Work within your role as ${agent.role}
2. Follow best practices for your role
3. Use \`@squad /progress @${agentName} <message>\` to report progress during work
4. When finished, use \`@squad /complete @${agentName} success <summary>\` or \`@squad /complete @${agentName} failure <reason>\`

Begin execution.`;
  }

  /**
   * Send the prompt to Copilot chat
   */
  private async sendToCopilot(prompt: string, contextLabel: string): Promise<void> {
    try {
      // Open Copilot chat with the prompt
      await vscode.commands.executeCommand('workbench.action.chat.open', {
        query: prompt,
        isPartialQuery: false,
      });

      vscode.window.showInformationMessage(
        `Squad: Task sent to Copilot for ${contextLabel}`
      );
    } catch (error) {
      // Fallback: try alternative approach
      try {
        await vscode.commands.executeCommand('workbench.action.chat.newChat');
        await new Promise(resolve => setTimeout(resolve, 300));
        await vscode.commands.executeCommand('workbench.action.chat.open', {
          query: prompt,
        });
      } catch (fallbackError) {
        vscode.window.showErrorMessage(
          `Squad: Failed to send task to Copilot. Make sure GitHub Copilot Chat is installed.`
        );
        throw fallbackError;
      }
    }
  }
}

export const copilotExecutor = new CopilotExecutor();
