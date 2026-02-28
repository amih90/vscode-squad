import * as vscode from 'vscode';
import { squadRegistry } from '../core/squadRegistry';
import type { Member } from '../team/teamState';
import type { AgentRuntime } from '../core/types';

export class TeamRosterProvider implements vscode.TreeDataProvider<RosterItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<RosterItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: RosterItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RosterItem): RosterItem[] {
    const ctx = squadRegistry.activeContext;
    if (!ctx) {
      return [];
    }

    const { teamState, agents } = ctx;

    if (!element) {
      return [
        new RosterItem('Coordinator', 'Coordinator section', vscode.TreeItemCollapsibleState.Collapsed),
        new RosterItem('Members', 'Members section', vscode.TreeItemCollapsibleState.Collapsed),
        new RosterItem('Coding Agent', 'Coding Agent section', vscode.TreeItemCollapsibleState.Collapsed),
      ];
    }

    if (element.label === 'Coordinator' && teamState.coordinator) {
      return [createMemberItem(teamState.coordinator, agents)];
    }

    if (element.label === 'Members') {
      return teamState.members.map((m) => createMemberItem(m, agents));
    }

    if (element.label === 'Coding Agent' && teamState.codingAgent) {
      return [createMemberItem(teamState.codingAgent, agents)];
    }

    return [];
  }

  getParent(element: RosterItem): vscode.ProviderResult<RosterItem> {
    if (element.parent) {
      return new RosterItem(element.parent, `${element.parent} section`, vscode.TreeItemCollapsibleState.Collapsed);
    }
    return null;
  }
}

export class RosterItem extends vscode.TreeItem {
  constructor(
    label: string,
    tooltip: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    public parent?: string,
    contextValue?: string,
    description?: string,
  ) {
    super(label, collapsibleState);
    this.tooltip = tooltip;
    this.contextValue = contextValue;
    if (description) {
      this.description = description;
    }
  }
}

function resolveContextValue(member: Member): string {
  if (member.section === 'coordinator') { return 'coordinator'; }
  if (member.section === 'codingAgent') { return 'codingAgent'; }
  const lower = member.name.toLowerCase();
  if (lower === 'scribe') { return 'scribe'; }
  if (lower === 'ralph') { return 'ralph'; }
  return 'member';
}

function parentLabel(member: Member): string {
  if (member.section === 'coordinator') { return 'Coordinator'; }
  if (member.section === 'codingAgent') { return 'Coding Agent'; }
  return 'Members';
}

function createMemberItem(member: Member, agents: Map<string, AgentRuntime>): RosterItem {
  const runtime = agents.get(member.name);
  const emoji = runtime?.emoji ?? member.notes ?? '👤';
  const label = `${emoji} ${member.name}`;
  const status = runtime?.status ?? member.status ?? 'idle';
  const tooltip = `${member.name} - ${member.role} (${status})`;
  const contextValue = resolveContextValue(member);

  return new RosterItem(
    label,
    tooltip,
    vscode.TreeItemCollapsibleState.None,
    parentLabel(member),
    contextValue,
    member.role,
  );
}
