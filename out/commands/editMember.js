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
exports.handleEditMember = handleEditMember;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../utils/logger");
const squadRegistry_1 = require("../core/squadRegistry");
const teamState_1 = require("../team/teamState");
const eventBus_1 = require("../core/eventBus");
async function handleEditMember(context, rosterProvider) {
    (0, logger_1.log)('Command: squad.editMember called');
    const ctx = squadRegistry_1.squadRegistry.activeContext;
    if (!ctx) {
        vscode.window.showWarningMessage('No active squad');
        return;
    }
    const allNames = [...ctx.agents.keys()];
    if (allNames.length === 0) {
        vscode.window.showWarningMessage('No members to edit');
        return;
    }
    const memberName = await vscode.window.showQuickPick(allNames, {
        placeHolder: 'Select member to edit',
    });
    if (!memberName) {
        return;
    }
    const field = await vscode.window.showQuickPick(['Role', 'Charter', 'Status', 'Notes'], {
        placeHolder: 'What do you want to edit?',
    });
    if (!field) {
        return;
    }
    const newValue = await vscode.window.showInputBox({
        prompt: `Enter new ${field.toLowerCase()}`,
        placeHolder: field === 'Role' ? 'e.g., Frontend Dev' : undefined,
    });
    if (newValue === undefined) {
        return;
    }
    const state = { ...ctx.teamState };
    const findAndUpdate = (name) => {
        const allMembers = [
            state.coordinator, ...state.members, state.codingAgent
        ].filter(Boolean);
        const m = allMembers.find(m => m.name === name);
        if (m) {
            const key = field.toLowerCase();
            m[key] = newValue || undefined;
        }
    };
    findAndUpdate(memberName);
    await (0, teamState_1.updateTeamState)(state);
    eventBus_1.eventBus.emit('team-changed', { squadPath: ctx.squadDir, state });
    vscode.window.showInformationMessage(`Squad: Updated ${memberName}'s ${field.toLowerCase()}`);
}
//# sourceMappingURL=editMember.js.map