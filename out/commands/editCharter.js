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
exports.handleEditCharter = handleEditCharter;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const squadRegistry_1 = require("../core/squadRegistry");
const squadTemplates_1 = require("../templates/squadTemplates");
async function handleEditCharter(agentNameArg) {
    const ctx = squadRegistry_1.squadRegistry.activeContext;
    if (!ctx) {
        vscode.window.showWarningMessage('No active squad');
        return;
    }
    const names = [...ctx.agents.keys()];
    if (names.length === 0) {
        vscode.window.showWarningMessage('No agents in the active squad');
        return;
    }
    let agentName = agentNameArg;
    if (!agentName) {
        agentName = await vscode.window.showQuickPick(names, {
            placeHolder: 'Select an agent to edit charter',
        });
    }
    if (!agentName) {
        return;
    }
    const agent = ctx.agents.get(agentName);
    const slug = agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const agentDir = path.join(ctx.squadDir, 'agents', slug);
    const charterPath = path.join(agentDir, 'charter.md');
    // Scaffold with rich charter if missing
    if (!fs.existsSync(charterPath)) {
        fs.mkdirSync(agentDir, { recursive: true });
        const role = agent?.role ?? 'Team Member';
        const projectName = path.basename(ctx.rootPath);
        const charter = (0, squadTemplates_1.generateCharter)(agentName, role, projectName);
        fs.writeFileSync(charterPath, charter, 'utf-8');
    }
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(charterPath));
    await vscode.window.showTextDocument(doc, { preview: false });
}
//# sourceMappingURL=editCharter.js.map