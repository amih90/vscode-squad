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
exports.handleAddMember = handleAddMember;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../utils/logger");
const squadRegistry_1 = require("../core/squadRegistry");
const teamState_1 = require("../team/teamState");
const eventBus_1 = require("../core/eventBus");
async function handleAddMember(context, rosterProvider) {
    (0, logger_1.log)('Command: squad.addMember called');
    const ctx = squadRegistry_1.squadRegistry.activeContext;
    if (!ctx) {
        vscode.window.showWarningMessage('No active squad. Create one first.');
        return;
    }
    const name = await vscode.window.showInputBox({
        prompt: 'Enter member name',
        placeHolder: 'e.g., Alice',
    });
    if (!name) {
        return;
    }
    const roleOptions = [
        'Coordinator', 'Backend Dev', 'Frontend Dev', 'Full-Stack Dev',
        'Tester', 'Designer', 'Architect', 'Security Agent',
        'Session Logger', 'Work Monitor',
        'Coding Agent', 'DevOps Agent', 'Custom...'
    ];
    const rolePick = await vscode.window.showQuickPick(roleOptions, {
        placeHolder: 'Select member role',
    });
    if (!rolePick) {
        return;
    }
    let role = rolePick;
    if (rolePick === 'Custom...') {
        const custom = await vscode.window.showInputBox({ prompt: 'Enter custom role' });
        if (!custom) {
            return;
        }
        role = custom;
    }
    const member = {
        name,
        role,
        section: role.toLowerCase().includes('coordinator') ? 'coordinator'
            : (name.toLowerCase().includes('@copilot') || role.toLowerCase().includes('coding agent')) ? 'codingAgent'
                : 'members',
    };
    const state = { ...ctx.teamState };
    switch (member.section) {
        case 'coordinator':
            state.coordinator = member;
            break;
        case 'codingAgent':
            state.codingAgent = member;
            break;
        default:
            state.members = [...state.members, member];
            break;
    }
    await (0, teamState_1.updateTeamState)(state);
    (0, teamState_1.scaffoldAgentDir)(ctx.squadDir, name, role);
    eventBus_1.eventBus.emit('team-changed', { squadPath: ctx.squadDir, state });
    vscode.window.showInformationMessage(`Squad: Added ${name} as ${role}`);
}
//# sourceMappingURL=addMember.js.map