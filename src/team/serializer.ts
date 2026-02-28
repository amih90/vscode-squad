import { TeamState, Member } from './teamState';
import { log } from '../utils/logger';

/**
 * Serialize a single member row for the markdown table.
 */
function memberRow(m: Member): string {
  const charter = m.charter ?? '—';
  const status = m.status ?? '';
  const notes = m.notes ?? '';
  return `| ${m.name} | ${m.role} | ${charter} | ${status} | ${notes} |`;
}

/**
 * Serialize the project context section.
 */
function serializeProjectContext(ctx: TeamState['projectContext']): string {
  if (!ctx) {
    return '';
  }
  const lines: string[] = ['## Project Context', ''];
  if (ctx.description) {
    lines.push(`- **Building:** ${ctx.description}`);
  }
  if (ctx.techStack) {
    lines.push(`- **Tech Stack:** ${ctx.techStack}`);
  }
  if (ctx.user) {
    lines.push(`- **User:** ${ctx.user}`);
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Collect all members (coordinator + members + codingAgent) preserving order.
 */
function gatherAllMembers(state: TeamState): Member[] {
  const all: Member[] = [];
  if (state.coordinator) {
    all.push(state.coordinator);
  }
  all.push(...state.members);
  if (state.codingAgent) {
    all.push(state.codingAgent);
  }
  return all;
}

/**
 * Preserve any content before `## Project Context` or `## Members` (e.g. the title).
 * If the original content has a title line we keep it; otherwise use a default.
 */
function extractTitle(originalContent: string | undefined): string {
  if (!originalContent) {
    return '# Team Roster';
  }
  const lines = originalContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line;
    }
  }
  return '# Team Roster';
}

/**
 * Serialize TeamState into markdown format for .squad/team.md
 * @param state - Current team state
 * @param originalContent - Optional original file content to preserve title and project context
 * @returns Markdown string ready to write to file
 */
export function serializeTeamFile(state: TeamState, originalContent?: string): string {
  log('Serializing team state');

  const title = extractTitle(originalContent);
  const parts: string[] = [title, ''];

  // Project context
  const ctxBlock = serializeProjectContext(state.projectContext);
  if (ctxBlock) {
    parts.push(ctxBlock);
  }

  // Members table
  const allMembers = gatherAllMembers(state);
  parts.push('## Members', '');
  parts.push('| Name | Role | Charter | Status | Notes |');
  parts.push('|------|------|---------|--------|-------|');
  for (const m of allMembers) {
    parts.push(memberRow(m));
  }
  parts.push('');

  return parts.join('\n');
}
