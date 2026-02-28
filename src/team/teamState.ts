import * as path from 'path';
import * as fs from 'fs';
import { log } from '../utils/logger';

export interface Member {
  name: string;
  role: string;
  charter?: string;
  status?: string;
  notes?: string;
  section: 'coordinator' | 'members' | 'codingAgent';
}

export interface TeamState {
  coordinator: Member | null;
  members: Member[];
  codingAgent: Member | null;
  filePath: string;
  lastModified: number;
}

let currentTeamState: TeamState | null = null;

export async function loadTeamState(workspaceRoot: string): Promise<TeamState | null> {
  const teamFilePath = path.join(workspaceRoot, '.squad', 'team.md');

  if (!fs.existsSync(teamFilePath)) {
    log('Team file not found at', teamFilePath);
    return null;
  }

  try {
    const content = fs.readFileSync(teamFilePath, 'utf-8');
    // TODO: Parse markdown content into TeamState
    // For now, return mock data
    currentTeamState = {
      coordinator: {
        name: 'Squad',
        role: 'Coordinator',
        notes: 'Team lead',
        section: 'coordinator',
      },
      members: [
        {
          name: 'Neo',
          role: 'Lead / Architect',
          charter: '.squad/agents/neo/charter.md',
          status: '✅ Active',
          section: 'members',
        },
      ],
      codingAgent: {
        name: '@copilot',
        role: 'Coding Agent',
        status: '🤖 Coding Agent',
        section: 'codingAgent',
      },
      filePath: teamFilePath,
      lastModified: Date.now(),
    };
    log('Team state loaded');
    return currentTeamState;
  } catch (err) {
    log('Error loading team state:', err);
    return null;
  }
}

export function getTeamState(): TeamState | null {
  return currentTeamState;
}

export async function updateTeamState(newState: TeamState): Promise<void> {
  currentTeamState = newState;
  // TODO: Serialize and write to disk
  log('Team state updated');
}
