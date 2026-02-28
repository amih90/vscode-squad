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
exports.handleRemoveMember = handleRemoveMember;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger");
const squadRegistry_1 = require("../core/squadRegistry");
const teamState_1 = require("../team/teamState");
const eventBus_1 = require("../core/eventBus");
async function handleRemoveMember(context, rosterProvider) {
    (0, logger_1.log)('Command: squad.removeMember called');
    const ctx = squadRegistry_1.squadRegistry.activeContext;
    if (!ctx) {
        vscode.window.showWarningMessage('No active squad');
        return;
    }
    const allNames = [...ctx.agents.keys()];
    if (allNames.length === 0) {
        vscode.window.showWarningMessage('No members to remove');
        return;
    }
    const memberName = await vscode.window.showQuickPick(allNames, {
        placeHolder: 'Select member to remove',
    });
    if (!memberName) {
        return;
    }
    const confirm = await vscode.window.showWarningMessage(`Remove ${memberName} from team? Agent files will be moved to _alumni/.`, { modal: true }, 'Remove');
    if (confirm === 'Remove') {
        // Move agent directory to alumni
        const slug = memberName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const agentDir = path.join(ctx.squadDir, 'agents', slug);
        const alumniDir = path.join(ctx.squadDir, 'agents', '_alumni');
        const alumniTarget = path.join(alumniDir, slug);
        if (fs.existsSync(agentDir)) {
            fs.mkdirSync(alumniDir, { recursive: true });
            if (fs.existsSync(alumniTarget)) {
                // If alumni already exists, append timestamp to avoid collision
                const timestamped = `${slug}-${Date.now()}`;
                fs.renameSync(agentDir, path.join(alumniDir, timestamped));
            }
            else {
                fs.renameSync(agentDir, alumniTarget);
            }
        }
        const state = { ...ctx.teamState };
        if (state.coordinator?.name === memberName) {
            state.coordinator = null;
        }
        else if (state.codingAgent?.name === memberName) {
            state.codingAgent = null;
        }
        else {
            state.members = state.members.filter(m => m.name !== memberName);
        }
        await (0, teamState_1.updateTeamState)(state);
        eventBus_1.eventBus.emit('team-changed', { squadPath: ctx.squadDir, state });
        vscode.window.showInformationMessage(`Squad: Moved ${memberName} to alumni`);
    }
}
//# sourceMappingURL=removeMember.js.map