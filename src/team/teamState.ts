import * as path from 'path';
import * as fs from 'fs';
import { log } from '../utils/logger';
import { parseTeamFile } from './parser';

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
  projectContext?: {
    description?: string;
    techStack?: string;
    user?: string;
  };
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
    currentTeamState = parseTeamFile(content, teamFilePath);
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
