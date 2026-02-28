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
exports.loadTeamState = loadTeamState;
exports.getTeamState = getTeamState;
exports.updateTeamState = updateTeamState;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const logger_1 = require("../utils/logger");
let currentTeamState = null;
async function loadTeamState(workspaceRoot) {
    const teamFilePath = path.join(workspaceRoot, '.squad', 'team.md');
    if (!fs.existsSync(teamFilePath)) {
        (0, logger_1.log)('Team file not found at', teamFilePath);
        return null;
    }
    try {
        const content = fs.readFileSync(teamFilePath, 'utf-8');
        // TODO: Parse markdown content into TeamState
        // For now, return mock data
        currentTeamState = {
            coordinator: {
                name: 'Squad',
                role: 'Coordinator',
                notes: 'Team lead',
                section: 'coordinator',
            },
            members: [
                {
                    name: 'Neo',
                    role: 'Lead / Architect',
                    charter: '.squad/agents/neo/charter.md',
                    status: '✅ Active',
                    section: 'members',
                },
            ],
            codingAgent: {
                name: '@copilot',
                role: 'Coding Agent',
                status: '🤖 Coding Agent',
                section: 'codingAgent',
            },
            filePath: teamFilePath,
            lastModified: Date.now(),
        };
        (0, logger_1.log)('Team state loaded');
        return currentTeamState;
    }
    catch (err) {
        (0, logger_1.log)('Error loading team state:', err);
        return null;
    }
}
function getTeamState() {
    return currentTeamState;
}
async function updateTeamState(newState) {
    currentTeamState = newState;
    // TODO: Serialize and write to disk
    (0, logger_1.log)('Team state updated');
}
//# sourceMappingURL=teamState.js.map