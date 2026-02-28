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
exports.scaffoldAgentDir = scaffoldAgentDir;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const logger_1 = require("../utils/logger");
const parser_1 = require("./parser");
const serializer_1 = require("./serializer");
let currentTeamState = null;
async function loadTeamState(squadDir) {
    const teamFilePath = path.join(squadDir, 'team.md');
    if (!fs.existsSync(teamFilePath)) {
        (0, logger_1.log)('Team file not found at', teamFilePath);
        return null;
    }
    try {
        const content = fs.readFileSync(teamFilePath, 'utf-8');
        currentTeamState = (0, parser_1.parseTeamFile)(content, teamFilePath);
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
    const oldContent = fs.existsSync(newState.filePath)
        ? fs.readFileSync(newState.filePath, 'utf-8')
        : undefined;
    const markdown = (0, serializer_1.serializeTeamFile)(newState, oldContent);
    const dir = path.dirname(newState.filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(newState.filePath, markdown, 'utf-8');
    currentTeamState = newState;
    (0, logger_1.log)('Team state updated and written to disk');
}
function scaffoldAgentDir(squadDir, agentName, role) {
    const slug = agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const agentDir = path.join(squadDir, 'agents', slug);
    if (fs.existsSync(agentDir)) {
        return;
    }
    fs.mkdirSync(agentDir, { recursive: true });
    // Use rich charter generation from templates
    const { generateCharter, generateHistory } = require('../templates/squadTemplates');
    const projectName = path.basename(squadDir);
    const charter = generateCharter(agentName, role, projectName);
    const history = generateHistory(agentName, role, projectName);
    fs.writeFileSync(path.join(agentDir, 'charter.md'), charter, 'utf-8');
    fs.writeFileSync(path.join(agentDir, 'history.md'), history, 'utf-8');
    (0, logger_1.log)(`Scaffolded agent directory for ${agentName} at ${agentDir}`);
}
//# sourceMappingURL=teamState.js.map