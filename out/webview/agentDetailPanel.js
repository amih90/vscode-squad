"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDetailPanel = void 0;
const vscode = __importStar(require("vscode"));
const webviewBridge_1 = require("./webviewBridge");
const squadRegistry_1 = require("../core/squadRegistry");
const eventBus_1 = require("../core/eventBus");
const logStore_1 = require("../monitoring/logStore");
const commandQueue_1 = require("../monitoring/commandQueue");
const statsEngine_1 = require("../monitoring/statsEngine");
class AgentDetailPanel {
    static createOrShow(extensionUri, agentName) {
        const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.Two;
        const existing = AgentDetailPanel.panels.get(agentName);
        if (existing) {
            existing.panel.reveal(column);
            return existing;
        }
        const panel = vscode.window.createWebviewPanel('squadAgentDetail', `Agent: ${agentName}`, column, (0, webviewBridge_1.getWebviewOptions)(extensionUri));
        const instance = new AgentDetailPanel(panel, extensionUri, agentName);
        AgentDetailPanel.panels.set(agentName, instance);
        return instance;
    }
    constructor(panel, extensionUri, agentName) {
        this.disposables = [];
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.agentName = agentName;
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.webview.onDidReceiveMessage((msg) => this.handleWebviewMessage(msg), null, this.disposables);
        this.setupEventListeners();
        this.updateHtml();
    }
    async updateHtml() {
        this.panel.webview.html = await this.getHtmlContent(this.panel.webview);
    }
    async getHtmlContent(webview) {
        const htmlPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'agentDetail', 'agentDetail.html');
        const htmlBytes = await vscode.workspace.fs.readFile(htmlPath);
        let html = Buffer.from(htmlBytes).toString('utf-8');
        const nonce = (0, webviewBridge_1.getNonce)();
        const cspSource = webview.cspSource;
        const cssUri = (0, webviewBridge_1.getWebviewUri)(webview, this.extensionUri, ['media', 'agentDetail', 'agentDetail.css']);
        const themeUri = (0, webviewBridge_1.getWebviewUri)(webview, this.extensionUri, ['media', 'shared', 'theme.css']);
        const resetUri = (0, webviewBridge_1.getWebviewUri)(webview, this.extensionUri, ['media', 'shared', 'reset.css']);
        const scriptUri = (0, webviewBridge_1.getWebviewUri)(webview, this.extensionUri, ['media', 'agentDetail', 'agentDetail.js']);
        html = html.replace(/\{\{nonce\}\}/g, nonce);
        html = html.replace(/\{\{cspSource\}\}/g, cspSource);
        html = html.replace(/\{\{cssUri\}\}/g, cssUri.toString());
        html = html.replace(/\{\{themeUri\}\}/g, themeUri.toString());
        html = html.replace(/\{\{resetUri\}\}/g, resetUri.toString());
        html = html.replace(/\{\{scriptUri\}\}/g, scriptUri.toString());
        return html;
    }
    async readAgentFile(fileName) {
        const ctx = squadRegistry_1.squadRegistry.activeContext;
        if (!ctx) {
            return '';
        }
        const filePath = vscode.Uri.file(`${ctx.squadDir}/agents/${this.agentName}/${fileName}`);
        try {
            const bytes = await vscode.workspace.fs.readFile(filePath);
            return Buffer.from(bytes).toString('utf-8');
        }
        catch {
            return '';
        }
    }
    async sendAgentState() {
        const ctx = squadRegistry_1.squadRegistry.activeContext;
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
        const state = {
            agent: {
                ...agent,
                statistics: statsEngine_1.statsEngine.getAgentStats(this.agentName),
            },
            logs: logStore_1.logStore.getEntriesForAgent(this.agentName),
            commandQueue: commandQueue_1.commandQueueManager.getQueueForAgent(this.agentName),
            historyContent,
            charterContent,
        };
        this.panel.webview.postMessage({ type: 'state-update', data: state });
    }
    handleWebviewMessage(message) {
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
                const filtered = logStore_1.logStore.getEntries({
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
                logStore_1.logStore.clear();
                this.sendAgentState();
                break;
        }
    }
    setupEventListeners() {
        const onLogEntry = (data) => {
            if (data.entry.agentName === this.agentName) {
                const msg = { type: 'log-entry', entry: data.entry };
                this.panel.webview.postMessage(msg);
            }
        };
        const onAgentStatus = (data) => {
            if (data.agentName === this.agentName) {
                const msg = { type: 'agent-status', name: data.agentName, status: data.status };
                this.panel.webview.postMessage(msg);
            }
        };
        const onTeamChanged = (_data) => {
            this.sendAgentState();
        };
        eventBus_1.eventBus.on('log-entry', onLogEntry);
        eventBus_1.eventBus.on('agent-status', onAgentStatus);
        eventBus_1.eventBus.on('team-changed', onTeamChanged);
        const themeDisposable = vscode.window.onDidChangeActiveColorTheme((theme) => {
            const kind = theme.kind === vscode.ColorThemeKind.Light
                ? 'light'
                : theme.kind === vscode.ColorThemeKind.HighContrast || theme.kind === vscode.ColorThemeKind.HighContrastLight
                    ? 'highContrast'
                    : 'dark';
            const msg = { type: 'theme-changed', kind };
            this.panel.webview.postMessage(msg);
        });
        this.disposables.push(themeDisposable, { dispose: () => eventBus_1.eventBus.off('log-entry', onLogEntry) }, { dispose: () => eventBus_1.eventBus.off('agent-status', onAgentStatus) }, { dispose: () => eventBus_1.eventBus.off('team-changed', onTeamChanged) });
    }
    dispose() {
        AgentDetailPanel.panels.delete(this.agentName);
        this.panel.dispose();
        for (const d of this.disposables) {
            d.dispose();
        }
        this.disposables = [];
    }
}
exports.AgentDetailPanel = AgentDetailPanel;
AgentDetailPanel.panels = new Map();
//# sourceMappingURL=agentDetailPanel.js.map