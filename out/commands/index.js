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
exports.registerCommands = registerCommands;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../utils/logger");
// Original commands
const initialize_1 = require("./initialize");
const openRoster_1 = require("./openRoster");
const addMember_1 = require("./addMember");
const removeMember_1 = require("./removeMember");
const editMember_1 = require("./editMember");
const refreshRoster_1 = require("./refreshRoster");
const openTeamFile_1 = require("./openTeamFile");
// Dashboard commands
const openDashboard_1 = require("./openDashboard");
const openAgentDetail_1 = require("./openAgentDetail");
// Monitoring commands
const showLogs_1 = require("./showLogs");
const clearLogs_1 = require("./clearLogs");
const filterLogs_1 = require("./filterLogs");
// Queue commands
const enqueueCommand_1 = require("./enqueueCommand");
const viewQueue_1 = require("./viewQueue");
const clearQueue_1 = require("./clearQueue");
// Multi-squad commands
const switchSquad_1 = require("./switchSquad");
const createSquad_1 = require("./createSquad");
const deleteSquad_1 = require("./deleteSquad");
// Insight commands
const viewDecisions_1 = require("./viewDecisions");
const viewHistory_1 = require("./viewHistory");
const showHealthScore_1 = require("./showHealthScore");
// Automation commands
const runCeremony_1 = require("./runCeremony");
const editCharter_1 = require("./editCharter");
// Search commands
const searchSquads_1 = require("./searchSquads");
// Stats commands
const showStats_1 = require("./showStats");
function registerCommands(context, rosterProvider) {
    const disposables = [];
    // --- Original 7 commands ---
    disposables.push(vscode.commands.registerCommand('squad.initialize', () => (0, initialize_1.handleInitialize)(context)), vscode.commands.registerCommand('squad.openRoster', () => (0, openRoster_1.handleOpenRoster)(context, rosterProvider)), vscode.commands.registerCommand('squad.addMember', () => (0, addMember_1.handleAddMember)(context, rosterProvider)), vscode.commands.registerCommand('squad.removeMember', () => (0, removeMember_1.handleRemoveMember)(context, rosterProvider)), vscode.commands.registerCommand('squad.editMember', () => (0, editMember_1.handleEditMember)(context, rosterProvider)), vscode.commands.registerCommand('squad.refreshRoster', () => (0, refreshRoster_1.handleRefreshRoster)(context, rosterProvider)), vscode.commands.registerCommand('squad.openTeamFile', () => (0, openTeamFile_1.handleOpenTeamFile)(context)));
    // --- Dashboard commands ---
    disposables.push(vscode.commands.registerCommand('squad.openDashboard', () => (0, openDashboard_1.handleOpenDashboard)(context)), vscode.commands.registerCommand('squad.openAgentDetail', (agentName) => (0, openAgentDetail_1.handleOpenAgentDetail)(context, agentName)));
    // --- Monitoring commands ---
    disposables.push(vscode.commands.registerCommand('squad.showLogs', () => (0, showLogs_1.handleShowLogs)()), vscode.commands.registerCommand('squad.clearLogs', () => (0, clearLogs_1.handleClearLogs)()), vscode.commands.registerCommand('squad.filterLogs', () => (0, filterLogs_1.handleFilterLogs)()));
    // --- Queue commands ---
    disposables.push(vscode.commands.registerCommand('squad.enqueueCommand', () => (0, enqueueCommand_1.handleEnqueueCommand)()), vscode.commands.registerCommand('squad.viewQueue', () => (0, viewQueue_1.handleViewQueue)()), vscode.commands.registerCommand('squad.clearQueue', () => (0, clearQueue_1.handleClearQueue)()));
    // --- Multi-squad commands ---
    disposables.push(vscode.commands.registerCommand('squad.switchSquad', (squadPath) => (0, switchSquad_1.handleSwitchSquad)(squadPath)), vscode.commands.registerCommand('squad.createSquad', () => (0, createSquad_1.handleCreateSquad)()), vscode.commands.registerCommand('squad.deleteSquad', () => (0, deleteSquad_1.handleDeleteSquad)()));
    // --- Insight commands ---
    disposables.push(vscode.commands.registerCommand('squad.viewDecisions', () => (0, viewDecisions_1.handleViewDecisions)()), vscode.commands.registerCommand('squad.viewHistory', () => (0, viewHistory_1.handleViewHistory)()), vscode.commands.registerCommand('squad.showHealthScore', () => (0, showHealthScore_1.handleShowHealthScore)()));
    // --- Automation commands ---
    disposables.push(vscode.commands.registerCommand('squad.runCeremony', () => (0, runCeremony_1.handleRunCeremony)()), vscode.commands.registerCommand('squad.editCharter', () => (0, editCharter_1.handleEditCharter)()));
    // --- Search commands ---
    disposables.push(vscode.commands.registerCommand('squad.searchSquads', () => (0, searchSquads_1.handleSearchSquads)()));
    // --- Stats commands ---
    disposables.push(vscode.commands.registerCommand('squad.showStats', () => (0, showStats_1.handleShowStats)()));
    (0, logger_1.log)('All 25 commands registered');
    return disposables;
}
//# sourceMappingURL=index.js.map