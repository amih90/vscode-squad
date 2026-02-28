import * as vscode from 'vscode';
import { squadRegistry } from '../core/squadRegistry';

export async function handleSearchSquads(): Promise<void> {
  const all = squadRegistry.allContexts;
  if (all.length === 0) {
    vscode.window.showWarningMessage('No squads registered');
    return;
  }

  const query = await vscode.window.showInputBox({
    prompt: 'Search across squads',
    placeHolder: 'e.g., agent name, role, or keyword',
  });

  if (!query) {
    return;
  }

  const lowerQuery = query.toLowerCase();
  const results: string[] = [];

  for (const ctx of all) {
    const squadLabel = ctx.rootPath;
    for (const [name, agent] of ctx.agents) {
      if (
        name.toLowerCase().includes(lowerQuery) ||
        agent.role.toLowerCase().includes(lowerQuery)
      ) {
        results.push(`[${squadLabel}] ${name} — ${agent.role}`);
      }
    }
  }

  const channel = vscode.window.createOutputChannel('Squad Search');
  channel.clear();

  if (results.length === 0) {
    channel.appendLine(`No results for "${query}".`);
  } else {
    channel.appendLine(`--- ${results.length} result(s) for "${query}" ---`);
    for (const r of results) {
      channel.appendLine(r);
    }
  }

  channel.show();
}
