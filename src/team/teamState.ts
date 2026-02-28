import * as path from 'path';
import * as fs from 'fs';
import { log } from '../utils/logger';
import { parseTeamFile } from './parser';
import { serializeTeamFile } from './serializer';

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

export async function loadTeamState(squadDir: string): Promise<TeamState | null> {
  const teamFilePath = path.join(squadDir, 'team.md');

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
  const oldContent = fs.existsSync(newState.filePath)
    ? fs.readFileSync(newState.filePath, 'utf-8')
    : undefined;
  const markdown = serializeTeamFile(newState, oldContent);
  const dir = path.dirname(newState.filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(newState.filePath, markdown, 'utf-8');
  currentTeamState = newState;
  log('Team state updated and written to disk');
}

export function scaffoldAgentDir(squadDir: string, agentName: string, role: string): void {
  const slug = agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const agentDir = path.join(squadDir, 'agents', slug);
  if (fs.existsSync(agentDir)) {
    return;
  }
  fs.mkdirSync(agentDir, { recursive: true });

  // Use rich charter generation from templates
  const { generateCharter, generateHistory } = require('../templates/squadTemplates');
  const projectName = path.basename(squadDir);
  const charter = generateCharter(agentName, role, projectName);
  const history = generateHistory(agentName, role, projectName);

  fs.writeFileSync(path.join(agentDir, 'charter.md'), charter, 'utf-8');
  fs.writeFileSync(path.join(agentDir, 'history.md'), history, 'utf-8');
  log(`Scaffolded agent directory for ${agentName} at ${agentDir}`);
}
