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
const teamState_1 = require("./team/teamState");
const rosterTreeProvider_1 = require("./views/rosterTreeProvider");
const watcher_1 = require("./team/watcher");
const index_1 = require("./commands/index");
let rosterProvider;
let disposables = [];
async function activate(context) {
    (0, logger_1.log)('VS Code Squad extension activated');
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        (0, logger_1.log)('No workspace folder found');
        return;
    }
    // Load team state if .squad/team.md exists
    const teamState = await (0, teamState_1.loadTeamState)(workspaceRoot);
    if (teamState) {
        (0, logger_1.log)('Team state loaded, initializing roster view');
        // Initialize tree data provider
        rosterProvider = new rosterTreeProvider_1.TeamRosterProvider(teamState);
        const treeView = vscode.window.createTreeView('squad.rosterView', {
            treeDataProvider: rosterProvider,
        });
        disposables.push(treeView);
        // Setup file watcher
        const watcher = (0, watcher_1.setupWatcher)(workspaceRoot, rosterProvider);
        disposables.push(watcher);
    }
    // Register all commands
    const commandDisposables = (0, index_1.registerCommands)(context, workspaceRoot, rosterProvider);
    disposables.push(...commandDisposables);
    // Add all disposables to context
    context.subscriptions.push(...disposables);
    (0, logger_1.log)('Extension ready');
}
function deactivate() {
    (0, logger_1.log)('VS Code Squad extension deactivated');
    disposables.forEach((d) => d.dispose());
    disposables = [];
}
//# sourceMappingURL=extension.js.map