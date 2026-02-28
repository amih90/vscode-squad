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
const initialize_1 = require("./initialize");
const openRoster_1 = require("./openRoster");
const addMember_1 = require("./addMember");
const removeMember_1 = require("./removeMember");
const editMember_1 = require("./editMember");
const refreshRoster_1 = require("./refreshRoster");
const openTeamFile_1 = require("./openTeamFile");
function registerCommands(context, workspaceRoot, rosterProvider) {
    const disposables = [];
    disposables.push(vscode.commands.registerCommand('squad.initialize', () => (0, initialize_1.handleInitialize)(context, workspaceRoot)), vscode.commands.registerCommand('squad.openRoster', () => (0, openRoster_1.handleOpenRoster)(context, workspaceRoot, rosterProvider)), vscode.commands.registerCommand('squad.addMember', () => (0, addMember_1.handleAddMember)(context, workspaceRoot, rosterProvider)), vscode.commands.registerCommand('squad.removeMember', () => (0, removeMember_1.handleRemoveMember)(context, workspaceRoot, rosterProvider)), vscode.commands.registerCommand('squad.editMember', () => (0, editMember_1.handleEditMember)(context, workspaceRoot, rosterProvider)), vscode.commands.registerCommand('squad.refreshRoster', () => (0, refreshRoster_1.handleRefreshRoster)(context, workspaceRoot, rosterProvider)), vscode.commands.registerCommand('squad.openTeamFile', () => (0, openTeamFile_1.handleOpenTeamFile)(context, workspaceRoot, rosterProvider)));
    (0, logger_1.log)('All 7 commands registered');
    return disposables;
}
//# sourceMappingURL=index.js.map