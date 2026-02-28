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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const logger_1 = require("./utils/logger");
const squadRegistry_1 = require("./core/squadRegistry");
const eventBus_1 = require("./core/eventBus");
const rosterTreeProvider_1 = require("./views/rosterTreeProvider");
const squadSelectorProvider_1 = require("./views/squadSelectorProvider");
const activityProvider_1 = require("./views/activityProvider");
const index_1 = require("./commands/index");
const squadChatParticipant_1 = require("./chat/squadChatParticipant");
let outputChannel;
async function activate(context) {
    outputChannel = vscode.window.createOutputChannel('Squad');
    (0, logger_1.log)('VS Code Squad extension v2 activated');
    // Scan workspace folders for squads
    await squadRegistry_1.squadRegistry.scanWorkspaceFolders();
    // Create tree view providers
    const selectorProvider = new squadSelectorProvider_1.SquadSelectorProvider();
    const rosterProvider = new rosterTreeProvider_1.TeamRosterProvider();
    const activityProvider = new activityProvider_1.ActivityProvider();
    // Register tree views
    const selectorView = vscode.window.createTreeView('squad.squadSelector', {
        treeDataProvider: selectorProvider,
    });
    const rosterView = vscode.window.createTreeView('squad.rosterView', {
        treeDataProvider: rosterProvider,
    });
    const activityView = vscode.window.createTreeView('squad.activityView', {
        treeDataProvider: activityProvider,
    });
    // Status bar items
    const squadNameItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    squadNameItem.command = 'squad.switchSquad';
    const healthItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    healthItem.command = 'squad.openDashboard';
    const actionsItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
    actionsItem.text = '$(zap) Agent';
    actionsItem.tooltip = 'Squad: Agent Actions';
    actionsItem.command = 'squad.agentActions';
    updateStatusBar(squadNameItem, healthItem, actionsItem);
    // Event listeners
    eventBus_1.eventBus.on('team-changed', () => {
        rosterProvider.refresh();
        selectorProvider.refresh();
        updateStatusBar(squadNameItem, healthItem, actionsItem);
    });
    eventBus_1.eventBus.on('squad-activated', () => {
        rosterProvider.refresh();
        selectorProvider.refresh();
        updateStatusBar(squadNameItem, healthItem, actionsItem);
    });
    eventBus_1.eventBus.on('log-entry', () => {
        activityProvider.refresh();
    });
    eventBus_1.eventBus.on('stats-updated', () => {
        updateStatusBar(squadNameItem, healthItem, actionsItem);
    });
    // Workspace folder changes
    const folderWatcher = vscode.workspace.onDidChangeWorkspaceFolders(async (e) => {
        for (const added of e.added) {
            await squadRegistry_1.squadRegistry.registerSquad(added.uri.fsPath);
        }
        for (const removed of e.removed) {
            squadRegistry_1.squadRegistry.unregisterSquad(removed.uri.fsPath);
        }
        selectorProvider.refresh();
        rosterProvider.refresh();
    });
    // Register all commands
    const commandDisposables = (0, index_1.registerCommands)(context, rosterProvider);
    // Auto-open dashboard if configured
    const autoOpen = vscode.workspace
        .getConfiguration('squad')
        .get('autoOpenDashboard', false);
    if (autoOpen && squadRegistry_1.squadRegistry.activeContext) {
        vscode.commands.executeCommand('squad.openDashboard');
    }
    // First-run: open walkthrough
    const hasSeenWalkthrough = context.globalState.get('squad.hasShownWalkthrough', false);
    if (!hasSeenWalkthrough) {
        context.globalState.update('squad.hasShownWalkthrough', true);
        vscode.commands.executeCommand('workbench.action.openWalkthrough', 'squad.squad#squad.gettingStarted', false);
    }
    // Push all disposables
    context.subscriptions.push(outputChannel, selectorView, rosterView, activityView, squadNameItem, healthItem, actionsItem, folderWatcher, ...commandDisposables, (0, squadChatParticipant_1.registerChatParticipant)(context), {
        dispose: () => {
            squadRegistry_1.squadRegistry.dispose();
            eventBus_1.eventBus.dispose();
        },
    });
}
function updateStatusBar(nameItem, healthItem, actionsItem) {
    const ctx = squadRegistry_1.squadRegistry.activeContext;
    if (ctx) {
        nameItem.text = `$(people) ${ctx.teamState.projectContext?.description ?? 'Squad'}`;
        nameItem.show();
        const score = ctx.statistics.healthScore;
        const emoji = score >= 80 ? '$(pass)' : score >= 50 ? '$(warning)' : '$(error)';
        healthItem.text = `${emoji} ${score}`;
        healthItem.tooltip = `Squad Health Score: ${score}/100`;
        healthItem.show();
        actionsItem.show();
    }
    else {
        nameItem.hide();
        healthItem.hide();
        actionsItem.hide();
    }
}
function deactivate() {
    (0, logger_1.log)('VS Code Squad extension deactivated');
}
//# sourceMappingURL=extension.js.map