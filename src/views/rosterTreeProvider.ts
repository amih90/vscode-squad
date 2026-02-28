import * as vscode from 'vscode';
import { Member, TeamState, getTeamState } from '../team/teamState';
import { log } from '../utils/logger';

export class TeamRosterProvider implements vscode.TreeDataProvider<RosterItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<RosterItem | undefined | null | void> =
    new vscode.EventEmitter<RosterItem | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<RosterItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private state: TeamState | null;

  constructor(initialState: TeamState | null) {
    this.state = initialState;
    log('TeamRosterProvider initialized');
  }

  refresh(): void {
    const newState = getTeamState();
    if (newState) {
      this.state = newState;
    }
    log('Tree view refreshed');
    this._onDidChangeTreeData.fire(null);
  }

  getTreeItem(element: RosterItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: RosterItem): Thenable<RosterItem[]> {
    if (!this.state) {
      log('No team state, returning empty children');
      return Promise.resolve([]);
    }

    if (!element) {
      // Root level: return sections
      return Promise.resolve([
        new RosterItem('Coordinator', 'Coordinator section', vscode.TreeItemCollapsibleState.Collapsed),
        new RosterItem('Members', 'Members section', vscode.TreeItemCollapsibleState.Collapsed),
        new RosterItem('Coding Agent', 'Coding Agent section', vscode.TreeItemCollapsibleState.Collapsed),
      ]);
    }

    // Child level: return members in section
    if (element.label === 'Coordinator' && this.state.coordinator) {
      return Promise.resolve([
        createMemberItem(this.state.coordinator),
      ]);
    }

    if (element.label === 'Members') {
      return Promise.resolve(this.state.members.map(createMemberItem));
    }

    if (element.label === 'Coding Agent' && this.state.codingAgent) {
      return Promise.resolve([
        createMemberItem(this.state.codingAgent),
      ]);
    }

    return Promise.resolve([]);
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
    public label: string,
    public tooltip: string,
    public collapsibleState: vscode.TreeItemCollapsibleState,
    public parent?: string,
    public contextValue?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = tooltip;
  }
}

function createMemberItem(member: Member): RosterItem {
  const contextValue = member.section === 'coordinator' ? 'coordinator' : 'member';
  return new RosterItem(
    member.name,
    `${member.name} - ${member.role}${member.status ? ` (${member.status})` : ''}`,
    vscode.TreeItemCollapsibleState.None,
    member.section === 'coordinator' ? 'Coordinator' : member.section === 'codingAgent' ? 'Coding Agent' : 'Members',
    contextValue,
  );
}
