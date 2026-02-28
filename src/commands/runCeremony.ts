import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

export async function handleRunCeremony(): Promise<void> {
  const ctx = squadRegistry.activeContext;
  if (!ctx) {
    vscode.window.showWarningMessage('No active squad');
    return;
  }

  const ceremoniesPath = path.join(ctx.squadDir, 'ceremonies.md');
  let ceremonies: string[] = ['Standup', 'Sprint Planning', 'Design Review', 'Retro'];

  if (fs.existsSync(ceremoniesPath)) {
    const content = fs.readFileSync(ceremoniesPath, 'utf-8');
    const headerMatches = content.match(/^##\s+(.+)$/gm);
    if (headerMatches && headerMatches.length > 0) {
      ceremonies = headerMatches.map((h) => h.replace(/^##\s+/, ''));
    }
  }

  const selected = await vscode.window.showQuickPick(ceremonies, {
    placeHolder: 'Select a ceremony to run',
  });

  if (!selected) {
    return;
  }

  const agents = [...ctx.agents.values()];
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString();
  let output = '';

  switch (selected.toLowerCase()) {
    case 'standup': {
      output = `# Standup — ${date}\n\n**Time:** ${time}\n**Attendees:** ${agents.map(a => a.name).join(', ')}\n\n`;
      for (const agent of agents) {
        output += `## ${agent.name} (${agent.role})\n`;
        output += `- **Status:** ${agent.status}\n`;
        output += `- **Yesterday:** \n`;
        output += `- **Today:** \n`;
        output += `- **Blockers:** \n\n`;
      }
      break;
    }
    case 'retro': {
      output = `# Retrospective — ${date}\n\n**Time:** ${time}\n\n`;
      output += `## What Went Well\n- \n\n## What Could Improve\n- \n\n## Action Items\n| Item | Owner | Due |\n|------|-------|-----|\n| | | |\n`;
      break;
    }
    case 'sprint planning': {
      output = `# Sprint Planning — ${date}\n\n**Time:** ${time}\n**Squad:** ${ctx.teamState.projectContext?.description ?? 'Squad'}\n\n`;
      output += `## Sprint Goal\n(define sprint goal)\n\n## Task Assignments\n\n`;
      for (const agent of agents) {
        output += `### ${agent.name} (${agent.role})\n- [ ] \n\n`;
      }
      break;
    }
    case 'design review': {
      output = `# Design Review — ${date}\n\n**Time:** ${time}\n**Reviewer:** \n\n`;
      output += `## Design Under Review\n(describe the design)\n\n## Feedback\n\n`;
      for (const agent of agents) {
        output += `### ${agent.name}\n- \n\n`;
      }
      output += `## Decision\n- [ ] Approved\n- [ ] Approved with changes\n- [ ] Needs revision\n`;
      break;
    }
    default: {
      output = `# ${selected} — ${date}\n\n**Time:** ${time}\n\n## Notes\n- \n`;
      break;
    }
  }

  // Write ceremony output
  const slug = selected.toLowerCase().replace(/\s+/g, '-');
  const outputDir = path.join(ctx.squadDir, 'ceremonies');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, `${slug}-${date}.md`);
  fs.writeFileSync(outputPath, output, 'utf-8');

  const doc = await vscode.workspace.openTextDocument(outputPath);
  await vscode.window.showTextDocument(doc, { preview: false });
  vscode.window.showInformationMessage(`Squad: Created ${selected} notes`);
}
