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

### CRITICAL: Status Reporting Protocol
**You MUST follow this protocol exactly for EACH agent:**

1. **BEFORE starting**, report the plan for each agent:
   \`@squad /progress @AgentName Starting: <brief plan for this agent>\`

2. **During execution**, report progress after each significant step:
   \`@squad /progress @AgentName <what was done>\`
   
3. **When each agent completes their part**:
   - Success: \`@squad /complete @AgentName success <summary>\`
   - Failure: \`@squad /complete @AgentName failure <reason>\`

### Execution Rules:
1. Analyze the task and determine which agent(s) should handle it based on their roles
2. Execute the task, working within the scope of the appropriate agent's responsibilities
3. If the task spans multiple agents, break it down and handle each part according to the relevant agent's charter
4. **Never skip status reports** - the squad dashboard tracks all agent progress
5. Report completion for ALL agents BEFORE giving your final response

Begin now by reporting your starting plan for each agent.`;

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

### CRITICAL: Status Reporting Protocol
**You MUST follow this protocol exactly:**

1. **BEFORE starting work**, report your plan:
   \`@squad /progress @${agentName} Starting: <brief plan>\`

2. **During execution**, report progress after each significant step (every 1-2 actions):
   \`@squad /progress @${agentName} <what you just did or are doing>\`

3. **When finished**, report completion:
   - Success: \`@squad /complete @${agentName} success <summary of what was done>\`
   - Failure: \`@squad /complete @${agentName} failure <what went wrong>\`

### Execution Rules:
- Work within your role as ${agent.role}
- Follow best practices for your role
- **Never skip status reports** - the squad dashboard tracks your progress
- Report completion BEFORE giving your final response to the user

Begin now by reporting your starting plan.`;
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
