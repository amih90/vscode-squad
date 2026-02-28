import * as vscode from 'vscode';
import { squadRegistry, SquadContext } from '../core/squadRegistry';
import { commandQueueManager } from '../monitoring/commandQueue';
import { log } from '../utils/logger';

const PARTICIPANT_ID = 'squad.chat';

export function registerChatParticipant(context: vscode.ExtensionContext): vscode.Disposable {
  const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, handler);
  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'icon.png');

  return participant;
}

const handler: vscode.ChatRequestHandler = async (
  request: vscode.ChatRequest,
  chatContext: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
): Promise<vscode.ChatResult> => {
  const command = request.command;

  if (command === 'status') {
    return handleStatus(stream);
  }

  if (command === 'switch') {
    return handleSwitch(request, stream);
  }

  if (command === 'assign') {
    return handleAssign(request, stream);
  }

  if (command === 'roster') {
    return handleRoster(stream);
  }

  if (command === 'agents') {
    return handleAgents(request, stream);
  }

  // Default: show help & squad context summary
  return handleDefault(request, stream);
};

function handleStatus(stream: vscode.ChatResponseStream): vscode.ChatResult {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    stream.markdown('No active squad. Use `/switch` to pick one, or create a squad first.');
    stream.button({ command: 'squad.createSquad', title: 'Create Squad' });
    return {};
  }

  const agents = [...ctx.agents.values()];
  stream.markdown(`## $(organization) ${ctx.squadName}\n\n`);
  stream.markdown(`**Agents:** ${agents.length}  \n`);
  stream.markdown(`**Health:** ${ctx.statistics.healthScore}/100  \n`);
  stream.markdown(`**Tasks:** ${ctx.statistics.completedTasks}/${ctx.statistics.totalTasks}  \n\n`);

  if (agents.length > 0) {
    stream.markdown('| Agent | Role | Status |\n|-------|------|--------|\n');
    for (const a of agents) {
      const statusIcon = a.status === 'active' ? '$(check)' : a.status === 'error' ? '$(error)' : '$(circle-outline)';
      stream.markdown(`| ${a.emoji} ${a.name} | ${a.role} | ${statusIcon} ${a.status} |\n`);
    }
  }

  stream.button({ command: 'squad.openDashboard', title: 'Open Dashboard' });
  return {};
}

async function handleSwitch(request: vscode.ChatRequest, stream: vscode.ChatResponseStream): Promise<vscode.ChatResult> {
  const squads = squadRegistry.allContexts;
  if (squads.length === 0) {
    stream.markdown('No squads found in the workspace.');
    stream.button({ command: 'squad.createSquad', title: 'Create Squad' });
    return {};
  }

  const query = request.prompt.trim().toLowerCase();

  if (query) {
    // Try to match by name
    const match = squads.find(s => s.squadName.toLowerCase() === query);
    if (match) {
      squadRegistry.setActiveSquad(match.squadDir);
      stream.markdown(`Switched to **${match.squadName}**`);
      stream.button({ command: 'squad.openDashboard', title: 'Open Dashboard' });
      return {};
    }

    // Fuzzy match
    const partial = squads.filter(s => s.squadName.toLowerCase().includes(query));
    if (partial.length === 1) {
      squadRegistry.setActiveSquad(partial[0].squadDir);
      stream.markdown(`Switched to **${partial[0].squadName}**`);
      stream.button({ command: 'squad.openDashboard', title: 'Open Dashboard' });
      return {};
    }

    if (partial.length > 1) {
      stream.markdown(`Multiple squads match "${query}":\n\n`);
      for (const s of partial) {
        stream.markdown(`- **${s.squadName}**\n`);
      }
      stream.markdown('\nBe more specific or use the picker:');
      stream.button({ command: 'squad.switchSquad', title: 'Switch Squad' });
      return {};
    }

    stream.markdown(`No squad matching "${query}". Available squads:\n\n`);
    for (const s of squads) {
      stream.markdown(`- **${s.squadName}**\n`);
    }
    return {};
  }

  // No query — list available squads
  stream.markdown('Available squads:\n\n');
  const active = squadRegistry.activeContext;
  for (const s of squads) {
    const marker = active && s.squadDir === active.squadDir ? ' $(check) *active*' : '';
    stream.markdown(`- **${s.squadName}**${marker}\n`);
  }
  stream.button({ command: 'squad.switchSquad', title: 'Switch Squad' });
  return {};
}

async function handleAssign(request: vscode.ChatRequest, stream: vscode.ChatResponseStream): Promise<vscode.ChatResult> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    stream.markdown('No active squad. Switch to one first.');
    stream.button({ command: 'squad.switchSquad', title: 'Switch Squad' });
    return {};
  }

  const agents = [...ctx.agents.keys()];
  if (agents.length === 0) {
    stream.markdown('No agents in the active squad.');
    stream.button({ command: 'squad.addMember', title: 'Add Member' });
    return {};
  }

  const prompt = request.prompt.trim();
  if (!prompt) {
    stream.markdown('Usage: `@squad /assign <task description>` — assigns to the whole squad\n\n');
    stream.markdown('Or: `@squad /assign @agentName <task description>` — assigns to a specific agent');
    return {};
  }

  // Check if an @agent is specified
  const mentionMatch = prompt.match(/^@(\S+)\s+(.+)$/);
  if (mentionMatch) {
    const targetName = mentionMatch[1];
    const task = mentionMatch[2];
    const found = agents.find(a => a.toLowerCase() === targetName.toLowerCase());
    if (!found) {
      stream.markdown(`Agent **${targetName}** not found. Available agents:\n\n`);
      for (const a of agents) {
        stream.markdown(`- ${a}\n`);
      }
      return {};
    }
    const item = commandQueueManager.enqueue(found, task);
    stream.markdown(`$(check) Task assigned to **${found}**: *${task}*\n\nQueue ID: \`${item.id}\``);
    return {};
  }

  // No @agent — assign to whole squad
  const items = agents.map(a => commandQueueManager.enqueue(a, prompt));
  stream.markdown(`$(check) Task assigned to all **${items.length}** agents: *${prompt}*`);
  return {};
}

function handleRoster(stream: vscode.ChatResponseStream): vscode.ChatResult {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    stream.markdown('No active squad.');
    stream.button({ command: 'squad.createSquad', title: 'Create Squad' });
    return {};
  }

  const agents = [...ctx.agents.values()];
  if (agents.length === 0) {
    stream.markdown(`**${ctx.squadName}** has no members yet.`);
    stream.button({ command: 'squad.addMember', title: 'Add Member' });
    return {};
  }

  stream.markdown(`## $(organization) ${ctx.squadName} — Roster\n\n`);
  for (const a of agents) {
    stream.markdown(`### ${a.emoji} ${a.name}\n`);
    stream.markdown(`**Role:** ${a.role}  \n`);
    stream.markdown(`**Status:** ${a.status}  \n`);
    if (a.charter) {
      stream.markdown(`**Charter:** ${a.charter}  \n`);
    }
    if (a.currentTask) {
      stream.markdown(`**Current Task:** ${a.currentTask}  \n`);
    }
    stream.markdown('\n');
  }

  stream.button({ command: 'squad.openDashboard', title: 'Open Dashboard' });
  return {};
}

function handleAgents(request: vscode.ChatRequest, stream: vscode.ChatResponseStream): vscode.ChatResult {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    stream.markdown('No active squad.');
    stream.button({ command: 'squad.createSquad', title: 'Create Squad' });
    return {};
  }

  const agents = [...ctx.agents.entries()];
  if (agents.length === 0) {
    stream.markdown(`**${ctx.squadName}** has no agents yet.`);
    stream.button({ command: 'squad.addMember', title: 'Add Member' });
    return {};
  }

  const query = request.prompt.trim().toLowerCase();

  // If a specific agent name was given, show detail for that agent
  if (query) {
    const match = agents.find(([name]) => name.toLowerCase() === query || name.toLowerCase().includes(query));
    if (match) {
      const [name, a] = match;
      stream.markdown(`## ${a.emoji} ${a.name}\n\n`);
      stream.markdown(`**Role:** ${a.role}  \n`);
      stream.markdown(`**Status:** ${a.status}  \n`);
      if (a.charter) {
        stream.markdown(`**Charter:** ${a.charter}  \n`);
      }
      if (a.currentTask) {
        stream.markdown(`**Current Task:** ${a.currentTask}  \n`);
      }
      stream.markdown(`\n**Stats:** ${a.statistics.completedTasks} completed, ${a.statistics.failedTasks} failed  \n`);

      const pending = commandQueueManager.getQueueForAgent(name).filter(i => i.status === 'queued' || i.status === 'running');
      if (pending.length > 0) {
        stream.markdown(`\n**Pending tasks (${pending.length}):**\n`);
        for (const item of pending) {
          stream.markdown(`- \`${item.id}\` ${item.command} *(${item.status})*\n`);
        }
      }

      stream.button({ command: 'squad.openAgentDetail', title: 'Open Detail', arguments: [name] });
      stream.button({ command: 'squad.editCharter', title: 'Edit Charter', arguments: [name] });
      return {};
    }

    stream.markdown(`No agent matching "${query}". Available agents:\n\n`);
    for (const [name, a] of agents) {
      stream.markdown(`- ${a.emoji} **${name}** — ${a.role}\n`);
    }
    return {};
  }

  // No query — list all agents as a pick-list
  stream.markdown(`## $(organization) ${ctx.squadName} — Agents\n\n`);
  for (const [name, a] of agents) {
    const statusIcon = a.status === 'active' ? '$(check)' : a.status === 'error' ? '$(error)' : a.status === 'working' ? '$(loading~spin)' : '$(circle-outline)';
    stream.markdown(`### ${a.emoji} ${name}\n`);
    stream.markdown(`${a.role} — ${statusIcon} ${a.status}\n\n`);
    stream.button({ command: 'squad.openAgentDetail', title: `Open ${name}`, arguments: [name] });
  }

  stream.markdown('\n---\nTip: Use `@squad /agents <name>` to see details for a specific agent.');
  return {};
}

function handleDefault(request: vscode.ChatRequest, stream: vscode.ChatResponseStream): vscode.ChatResult {
  const ctx = squadRegistry.activeContext;
  const squadInfo = ctx ? `Active squad: **${ctx.squadName}** (${[...ctx.agents.keys()].length} agents)` : 'No active squad';

  stream.markdown(`## $(organization) Squad Chat\n\n${squadInfo}\n\n`);
  stream.markdown('**Commands:**\n\n');
  stream.markdown('- `/status` — Show squad status and agents\n');
  stream.markdown('- `/switch [name]` — Switch active squad\n');
  stream.markdown('- `/assign [task]` — Assign task to all agents\n');
  stream.markdown('- `/assign @agent [task]` — Assign task to specific agent\n');
  stream.markdown('- `/roster` — Show detailed roster\n');
  stream.markdown('- `/agents [name]` — List agents or view a specific agent\n');

  if (!ctx) {
    stream.button({ command: 'squad.createSquad', title: 'Create Squad' });
  }
  return {};
}
