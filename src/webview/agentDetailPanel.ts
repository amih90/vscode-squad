import * as vscode from 'vscode';
import { getNonce, getWebviewUri, getWebviewOptions } from './webviewBridge';
import { squadRegistry } from '../core/squadRegistry';
import { eventBus, type SquadEvents } from '../core/eventBus';
import { logStore } from '../monitoring/logStore';
import { commandQueueManager } from '../monitoring/commandQueue';
import { statsEngine } from '../monitoring/statsEngine';
import type {
  AgentRuntime,
  HostToWebviewMessage,
  WebviewToHostMessage,
} from '../core/types';

interface AgentDetailState {
  agent: AgentRuntime;
  logs: ReturnType<typeof logStore.getEntries>;
  commandQueue: ReturnType<typeof commandQueueManager.getQueueForAgent>;
  historyContent: string;
  charterContent: string;
}

export class AgentDetailPanel {
  private static panels = new Map<string, AgentDetailPanel>();

  private readonly panel: vscode.WebviewPanel;
  private readonly agentName: string;
  private readonly extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, agentName: string): AgentDetailPanel {
    const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.Two;

    const existing = AgentDetailPanel.panels.get(agentName);
    if (existing) {
      existing.panel.reveal(column);
      return existing;
    }

    const panel = vscode.window.createWebviewPanel(
      'squadAgentDetail',
      `Agent: ${agentName}`,
      column,
      getWebviewOptions(extensionUri),
    );

    const instance = new AgentDetailPanel(panel, extensionUri, agentName);
    AgentDetailPanel.panels.set(agentName, instance);
    return instance;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    agentName: string,
  ) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.agentName = agentName;

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      (msg: WebviewToHostMessage) => this.handleWebviewMessage(msg),
      null,
      this.disposables,
    );

    this.setupEventListeners();
    this.updateHtml();
  }

  private async updateHtml(): Promise<void> {
    this.panel.webview.html = await this.getHtmlContent(this.panel.webview);
  }

  private async getHtmlContent(webview: vscode.Webview): Promise<string> {
    const htmlPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'agentDetail', 'agentDetail.html');
    const htmlBytes = await vscode.workspace.fs.readFile(htmlPath);
    let html = Buffer.from(htmlBytes).toString('utf-8');

    const nonce = getNonce();
    const cspSource = webview.cspSource;
    const cssUri = getWebviewUri(webview, this.extensionUri, ['media', 'agentDetail', 'agentDetail.css']);
    const themeUri = getWebviewUri(webview, this.extensionUri, ['media', 'shared', 'theme.css']);
    const resetUri = getWebviewUri(webview, this.extensionUri, ['media', 'shared', 'reset.css']);
    const scriptUri = getWebviewUri(webview, this.extensionUri, ['media', 'agentDetail', 'agentDetail.js']);

    html = html.replace(/\{\{nonce\}\}/g, nonce);
    html = html.replace(/\{\{cspSource\}\}/g, cspSource);
    html = html.replace(/\{\{cssUri\}\}/g, cssUri.toString());
    html = html.replace(/\{\{themeUri\}\}/g, themeUri.toString());
    html = html.replace(/\{\{resetUri\}\}/g, resetUri.toString());
    html = html.replace(/\{\{scriptUri\}\}/g, scriptUri.toString());

    return html;
  }

  private async readAgentFile(fileName: string): Promise<string> {
    const ctx = squadRegistry.activeContext;
    if (!ctx) {
      return '';
    }

    const filePath = vscode.Uri.file(
      `${ctx.squadDir}/agents/${this.agentName}/${fileName}`,
    );

    try {
      const bytes = await vscode.workspace.fs.readFile(filePath);
      return Buffer.from(bytes).toString('utf-8');
    } catch {
      return '';
    }
  }

  private async sendAgentState(): Promise<void> {
    const ctx = squadRegistry.activeContext;
    if (!ctx) {
      return;
    }

    const agent = ctx.agents.get(this.agentName);
    if (!agent) {
      return;
    }

    const [historyContent, charterContent] = await Promise.all([
      this.readAgentFile('history.md'),
      this.readAgentFile('charter.md'),
    ]);

    const state: AgentDetailState = {
      agent: {
        ...agent,
        statistics: statsEngine.getAgentStats(this.agentName),
      },
      logs: logStore.getEntriesForAgent(this.agentName),
      commandQueue: commandQueueManager.getQueueForAgent(this.agentName),
      historyContent,
      charterContent,
    };

    this.panel.webview.postMessage({ type: 'state-update', data: state });
  }

  private handleWebviewMessage(message: WebviewToHostMessage): void {
    switch (message.type) {
      case 'ready':
        this.sendAgentState();
        break;
      case 'request-state':
        this.sendAgentState();
        break;
      case 'run-command': {
        const args = message.args ?? [];
        vscode.commands.executeCommand(message.command, ...args);
        break;
      }
      case 'filter-logs': {
        const filtered = logStore.getEntries({
          agent: this.agentName,
          level: message.level,
        });
        this.panel.webview.postMessage({
          type: 'state-update',
          data: { logs: filtered },
        });
        break;
      }
      case 'select-agent':
        break;
      case 'clear-logs':
        logStore.clear();
        this.sendAgentState();
        break;
    }
  }

  private setupEventListeners(): void {
    const onLogEntry = (data: SquadEvents['log-entry']) => {
      if (data.entry.agentName === this.agentName) {
        const msg: HostToWebviewMessage = { type: 'log-entry', entry: data.entry };
        this.panel.webview.postMessage(msg);
      }
    };

    const onAgentStatus = (data: SquadEvents['agent-status']) => {
      if (data.agentName === this.agentName) {
        const msg: HostToWebviewMessage = { type: 'agent-status', name: data.agentName, status: data.status };
        this.panel.webview.postMessage(msg);
      }
    };

    const onTeamChanged = (_data: SquadEvents['team-changed']) => {
      this.sendAgentState();
    };

    eventBus.on('log-entry', onLogEntry);
    eventBus.on('agent-status', onAgentStatus);
    eventBus.on('team-changed', onTeamChanged);

    const themeDisposable = vscode.window.onDidChangeActiveColorTheme((theme) => {
      const kind = theme.kind === vscode.ColorThemeKind.Light
        ? 'light'
        : theme.kind === vscode.ColorThemeKind.HighContrast || theme.kind === vscode.ColorThemeKind.HighContrastLight
          ? 'highContrast'
          : 'dark';
      const msg: HostToWebviewMessage = { type: 'theme-changed', kind };
      this.panel.webview.postMessage(msg);
    });

    this.disposables.push(
      themeDisposable,
      { dispose: () => eventBus.off('log-entry', onLogEntry) },
      { dispose: () => eventBus.off('agent-status', onAgentStatus) },
      { dispose: () => eventBus.off('team-changed', onTeamChanged) },
    );
  }

  public dispose(): void {
    AgentDetailPanel.panels.delete(this.agentName);
    this.panel.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
