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
exports.DashboardPanel = void 0;
const vscode = __importStar(require("vscode"));
const webviewBridge_1 = require("./webviewBridge");
const squadRegistry_1 = require("../core/squadRegistry");
const eventBus_1 = require("../core/eventBus");
const logStore_1 = require("../monitoring/logStore");
const commandQueue_1 = require("../monitoring/commandQueue");
const statsEngine_1 = require("../monitoring/statsEngine");
class DashboardPanel {
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;
        if (DashboardPanel.currentPanel) {
            DashboardPanel.currentPanel.panel.reveal(column);
            return DashboardPanel.currentPanel;
        }
        const panel = vscode.window.createWebviewPanel('squadDashboard', 'Squad Dashboard', column, (0, webviewBridge_1.getWebviewOptions)(extensionUri));
        DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri);
        return DashboardPanel.currentPanel;
    }
    constructor(panel, extensionUri) {
        this.disposables = [];
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.webview.onDidReceiveMessage((msg) => this.handleWebviewMessage(msg), null, this.disposables);
        this.setupEventListeners();
        this.updateHtml();
    }
    async updateHtml() {
        this.panel.webview.html = await this.getHtmlContent(this.panel.webview);
    }
    async getHtmlContent(webview) {
        const htmlPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'dashboard', 'dashboard.html');
        const htmlBytes = await vscode.workspace.fs.readFile(htmlPath);
        let html = Buffer.from(htmlBytes).toString('utf-8');
        const nonce = (0, webviewBridge_1.getNonce)();
        const cspSource = webview.cspSource;
        const cssUri = (0, webviewBridge_1.getWebviewUri)(webview, this.extensionUri, ['media', 'dashboard', 'dashboard.css']);
        const themeUri = (0, webviewBridge_1.getWebviewUri)(webview, this.extensionUri, ['media', 'shared', 'theme.css']);
        const resetUri = (0, webviewBridge_1.getWebviewUri)(webview, this.extensionUri, ['media', 'shared', 'reset.css']);
        const scriptUri = (0, webviewBridge_1.getWebviewUri)(webview, this.extensionUri, ['media', 'dashboard', 'dashboard.js']);
        html = html.replace(/\{\{nonce\}\}/g, nonce);
        html = html.replace(/\{\{cspSource\}\}/g, cspSource);
        html = html.replace(/\{\{cssUri\}\}/g, cssUri.toString());
        html = html.replace(/\{\{themeUri\}\}/g, themeUri.toString());
        html = html.replace(/\{\{resetUri\}\}/g, resetUri.toString());
        html = html.replace(/\{\{scriptUri\}\}/g, scriptUri.toString());
        return html;
    }
    sendStateUpdate() {
        const ctx = squadRegistry_1.squadRegistry.activeContext;
        if (!ctx) {
            return;
        }
        const agents = [...ctx.agents.values()];
        const state = {
            squadName: ctx.teamState.projectContext?.description ?? 'Squad',
            squadPath: ctx.rootPath,
            agents,
            logs: logStore_1.logStore.getEntries(),
            commandQueue: commandQueue_1.commandQueueManager.getQueue(),
            statistics: statsEngine_1.statsEngine.getSquadStats(agents),
        };
        const message = { type: 'state-update', data: state };
        this.panel.webview.postMessage(message);
    }
    handleWebviewMessage(message) {
        switch (message.type) {
            case 'ready':
                this.sendStateUpdate();
                break;
            case 'request-state':
                this.sendStateUpdate();
                break;
            case 'run-command': {
                const args = message.args ?? [];
                vscode.commands.executeCommand(message.command, ...args);
                break;
            }
            case 'filter-logs': {
                const filtered = logStore_1.logStore.getEntries({
                    agent: message.agent,
                    level: message.level,
                });
                const logMsg = {
                    type: 'state-update',
                    data: {
                        squadName: squadRegistry_1.squadRegistry.activeContext?.teamState.projectContext?.description ?? 'Squad',
                        squadPath: squadRegistry_1.squadRegistry.activeContext?.rootPath ?? '',
                        agents: [...(squadRegistry_1.squadRegistry.activeContext?.agents.values() ?? [])],
                        logs: filtered,
                        commandQueue: commandQueue_1.commandQueueManager.getQueue(),
                        statistics: statsEngine_1.statsEngine.getSquadStats([...(squadRegistry_1.squadRegistry.activeContext?.agents.values() ?? [])]),
                    },
                };
                this.panel.webview.postMessage(logMsg);
                break;
            }
            case 'select-agent': {
                vscode.commands.executeCommand('squad.openAgentDetail', message.name);
                break;
            }
            case 'clear-logs':
                logStore_1.logStore.clear();
                this.sendStateUpdate();
                break;
        }
    }
    setupEventListeners() {
        const onLogEntry = (data) => {
            const msg = { type: 'log-entry', entry: data.entry };
            this.panel.webview.postMessage(msg);
        };
        const onAgentStatus = (data) => {
            const msg = { type: 'agent-status', name: data.agentName, status: data.status };
            this.panel.webview.postMessage(msg);
        };
        const onStatsUpdated = (_data) => {
            const ctx = squadRegistry_1.squadRegistry.activeContext;
            if (ctx) {
                const agents = [...ctx.agents.values()];
                const msg = { type: 'stats-update', stats: statsEngine_1.statsEngine.getSquadStats(agents) };
                this.panel.webview.postMessage(msg);
            }
        };
        const onTeamChanged = (_data) => {
            this.sendStateUpdate();
        };
        eventBus_1.eventBus.on('log-entry', onLogEntry);
        eventBus_1.eventBus.on('agent-status', onAgentStatus);
        eventBus_1.eventBus.on('stats-updated', onStatsUpdated);
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
        this.disposables.push(themeDisposable, { dispose: () => eventBus_1.eventBus.off('log-entry', onLogEntry) }, { dispose: () => eventBus_1.eventBus.off('agent-status', onAgentStatus) }, { dispose: () => eventBus_1.eventBus.off('stats-updated', onStatsUpdated) }, { dispose: () => eventBus_1.eventBus.off('team-changed', onTeamChanged) });
    }
    dispose() {
        DashboardPanel.currentPanel = undefined;
        this.panel.dispose();
        for (const d of this.disposables) {
            d.dispose();
        }
        this.disposables = [];
    }
}
exports.DashboardPanel = DashboardPanel;
//# sourceMappingURL=dashboardPanel.js.map