import * as vscode from 'vscode';
import * as path from 'path';
import { squadRegistry, SquadContext } from '../core/squadRegistry';

export class SquadSelectorProvider implements vscode.TreeDataProvider<SquadSelectorItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SquadSelectorItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SquadSelectorItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SquadSelectorItem): SquadSelectorItem[] {
    if (element) {
      return [];
    }

    const activePath = squadRegistry.activeSquadPath;
    return squadRegistry.allContexts.map((ctx) => {
      const isActive = ctx.rootPath === activePath;
      return createSquadItem(ctx, isActive);
    });
  }
}

function deriveLabel(ctx: SquadContext, isActive: boolean): string {
  const description = ctx.teamState.projectContext?.description;
  const name = description ?? path.basename(ctx.rootPath);
  return isActive ? `★ ${name}` : name;
}

function createSquadItem(ctx: SquadContext, isActive: boolean): SquadSelectorItem {
  const label = deriveLabel(ctx, isActive);
  const agentCount = ctx.agents.size;
  return new SquadSelectorItem(label, ctx.rootPath, isActive, agentCount);
}

export class SquadSelectorItem extends vscode.TreeItem {
  constructor(
    label: string,
    public readonly squadPath: string,
    public readonly isActive: boolean,
    agentCount: number,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = isActive ? `(active) · ${agentCount} agents` : `${agentCount} agents`;
    this.tooltip = squadPath;
    this.contextValue = isActive ? 'activeSquad' : 'squad';
    this.command = {
      command: 'squad.switchSquad',
      title: 'Switch Squad',
      arguments: [squadPath],
    };
    this.iconPath = isActive
      ? new vscode.ThemeIcon('star-full')
      : new vscode.ThemeIcon('folder');
  }
}
