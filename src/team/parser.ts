import { TeamState, Member } from './teamState';
import { log } from '../utils/logger';

interface ProjectContext {
  description?: string;
  techStack?: string;
  user?: string;
}

function parseProjectContext(section: string): ProjectContext {
  const ctx: ProjectContext = {};
  for (const line of section.split('\n')) {
    const trimmed = line.trim();
    const match = trimmed.match(/^-\s+\*\*(.+?):\*\*\s*(.+)$/);
    if (!match) {
      continue;
    }
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (key === 'building' || key === 'description') {
      ctx.description = value;
    } else if (key === 'tech stack' || key === 'stack') {
      ctx.techStack = value;
    } else if (key === 'user') {
      ctx.user = value;
    }
  }
  return ctx;
}

function classifyMember(member: Member): Member['section'] {
  const role = member.role.toLowerCase();
  const name = member.name.toLowerCase();
  if (role.includes('coordinator')) {
    return 'coordinator';
  }
  if (name.includes('@copilot') || role.includes('coding agent')) {
    return 'codingAgent';
  }
  return 'members';
}

function parseMembersTable(tableSection: string): Member[] {
  const lines = tableSection.split('\n').filter((l) => l.trim().length > 0);
  const members: Member[] = [];

  let headerFound = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      continue;
    }

    // Detect header row by checking for known column names
    if (!headerFound) {
      if (trimmed.toLowerCase().includes('name') && trimmed.toLowerCase().includes('role')) {
        headerFound = true;
      }
      continue;
    }

    // Skip separator row (e.g. |------|------|)
    if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
      continue;
    }

    // Parse data row
    const cells = trimmed
      .split('|')
      .slice(1, -1) // remove leading/trailing empty strings from split
      .map((c) => c.trim());

    if (cells.length < 2) {
      continue;
    }

    const member: Member = {
      name: cells[0] ?? '',
      role: cells[1] ?? '',
      charter: cells[2] && cells[2] !== '—' ? cells[2] : undefined,
      status: cells[3] || undefined,
      notes: cells[4] || undefined,
      section: 'members', // placeholder, classified below
    };

    member.section = classifyMember(member);
    members.push(member);
  }

  return members;
}

/**
 * Extracts the content of a markdown section by heading.
 * Returns everything between the heading and the next heading of equal or higher level.
 */
function extractSection(content: string, heading: string): string | null {
  const headingLevel = heading.match(/^(#+)/)?.[1].length ?? 2;
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `^${escapedHeading}\\s*$`,
    'm',
  );
  const match = pattern.exec(content);
  if (!match) {
    return null;
  }
  const start = match.index + match[0].length;
  // Find the next heading of equal or higher level
  const nextHeadingPattern = new RegExp(
    `^#{1,${headingLevel}}\\s+`,
    'm',
  );
  const rest = content.slice(start);
  const nextMatch = nextHeadingPattern.exec(rest);
  if (nextMatch) {
    return rest.slice(0, nextMatch.index);
  }
  return rest;
}

/**
 * Parse markdown team file content into TeamState.
 * @param content - Raw markdown file content
 * @param filePath - Path to the team file
 * @returns Parsed TeamState
 */
export function parseTeamFile(content: string, filePath: string): TeamState {
  log('Parsing team file: ' + filePath);

  const state: TeamState = {
    coordinator: null,
    members: [],
    codingAgent: null,
    filePath,
    lastModified: Date.now(),
  };

  // Parse project context
  const contextSection = extractSection(content, '## Project Context');
  if (contextSection) {
    state.projectContext = parseProjectContext(contextSection);
  }

  // Parse members table
  const membersSection = extractSection(content, '## Members');
  if (membersSection) {
    const allMembers = parseMembersTable(membersSection);
    for (const member of allMembers) {
      switch (member.section) {
        case 'coordinator':
          state.coordinator = member;
          break;
        case 'codingAgent':
          state.codingAgent = member;
          break;
        default:
          state.members.push(member);
          break;
      }
    }
  }

  return state;
}
