import { TeamState, Member } from './teamState';
import { log } from '../utils/logger';

/**
 * Serialize TeamState into markdown format for .squad/team.md
 * @param state - Current team state
 * @returns Markdown string ready to write to file
 */
export function serializeTeamFile(state: TeamState): string {
  // TODO: Implement markdown serialization logic
  // Generate markdown tables for Coordinator, Members, Coding Agent sections
  
  log('Serializing team state');
  
  let content = '# Team Roster\n\n';
  
  if (state.coordinator) {
    content += '## Coordinator\n\n';
    content += '| Name | Role | Notes |\n';
    content += '|------|------|-------|\n';
    content += `| ${state.coordinator.name} | ${state.coordinator.role} | ${state.coordinator.notes || ''} |\n\n`;
  }

  if (state.members.length > 0) {
    content += '## Members\n\n';
    content += '| Name | Role | Charter | Status |\n';
    content += '|------|------|---------|--------|\n';
    state.members.forEach((member) => {
      content += `| ${member.name} | ${member.role} | ${member.charter || ''} | ${member.status || ''} |\n`;
    });
    content += '\n';
  }

  if (state.codingAgent) {
    content += '## Coding Agent\n\n';
    content += '| Name | Role | Charter | Status |\n';
    content += '|------|------|---------|--------|\n';
    content += `| ${state.codingAgent.name} | ${state.codingAgent.role} | ${state.codingAgent.charter || ''} | ${state.codingAgent.status || ''} |\n`;
  }

  return content;
}
