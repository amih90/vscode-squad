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
exports.handleCreateSquad = handleCreateSquad;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const squadRegistry_1 = require("../core/squadRegistry");
const squadTemplates_1 = require("../templates/squadTemplates");
async function handleCreateSquad() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        vscode.window.showWarningMessage('No workspace folder open');
        return;
    }
    let targetFolder;
    if (folders.length === 1) {
        targetFolder = folders[0];
    }
    else {
        const picked = await vscode.window.showWorkspaceFolderPick({
            placeHolder: 'Select workspace folder for the new squad',
        });
        if (!picked) {
            return;
        }
        targetFolder = picked;
    }
    // Ask for squad name
    const squadName = await vscode.window.showInputBox({
        prompt: 'Enter a name for the new squad',
        placeHolder: 'e.g., frontend-team',
        validateInput: (value) => {
            if (!value || !value.trim()) {
                return 'Squad name is required';
            }
            if (!/^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/.test(value.trim())) {
                return 'Name must start with alphanumeric and contain only letters, numbers, spaces, hyphens, or underscores';
            }
            const slug = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const squadDir = path.join(targetFolder.uri.fsPath, '.squad', 'squads', slug);
            if (fs.existsSync(squadDir)) {
                return `A squad named "${slug}" already exists in this folder`;
            }
            return undefined;
        },
    });
    if (!squadName) {
        return;
    }
    const slug = squadName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const squadDir = path.join(targetFolder.uri.fsPath, '.squad', 'squads', slug);
    // Template selection
    const templatePick = await vscode.window.showQuickPick(squadTemplates_1.SQUAD_TEMPLATES.map(t => ({ label: t.label, description: t.description, id: t.id })), { placeHolder: 'Choose a squad template' });
    if (!templatePick) {
        return;
    }
    const template = squadTemplates_1.SQUAD_TEMPLATES.find(t => t.id === templatePick.id);
    const projectName = targetFolder.name;
    // ── Core directories ──────────────────────────────────────────────────
    fs.mkdirSync(squadDir, { recursive: true });
    fs.mkdirSync(path.join(squadDir, 'agents'), { recursive: true });
    fs.mkdirSync(path.join(squadDir, 'agents', '_alumni'), { recursive: true });
    fs.mkdirSync(path.join(squadDir, 'decisions'), { recursive: true });
    fs.mkdirSync(path.join(squadDir, 'decisions', 'inbox'), { recursive: true });
    fs.mkdirSync(path.join(squadDir, 'casting'), { recursive: true });
    fs.mkdirSync(path.join(squadDir, 'log'), { recursive: true });
    fs.mkdirSync(path.join(squadDir, 'orchestration-log'), { recursive: true });
    fs.mkdirSync(path.join(squadDir, 'skills'), { recursive: true });
    fs.mkdirSync(path.join(squadDir, 'ceremonies'), { recursive: true });
    // ── Core files ────────────────────────────────────────────────────────
    fs.writeFileSync(path.join(squadDir, 'team.md'), template.teamMd, 'utf-8');
    fs.writeFileSync(path.join(squadDir, 'decisions.md'), '# Decisions\n\nShared brain for the team. All agents should read this before every session.\n', 'utf-8');
    fs.writeFileSync(path.join(squadDir, 'ceremonies.md'), template.ceremoniesMd, 'utf-8');
    // Routing — use template-specific if provided, else generate from agents
    const routingContent = template.routingMd || (0, squadTemplates_1.generateRouting)(template.agents);
    fs.writeFileSync(path.join(squadDir, 'routing.md'), routingContent, 'utf-8');
    // ── Casting system ────────────────────────────────────────────────────
    fs.writeFileSync(path.join(squadDir, 'casting', 'policy.json'), JSON.stringify({
        universe: 'custom',
        description: 'Agent naming and identity policy',
        rules: ['Names should be descriptive of the role', 'Each agent has a unique identity'],
    }, null, 2), 'utf-8');
    fs.writeFileSync(path.join(squadDir, 'casting', 'registry.json'), JSON.stringify({
        agents: template.agents.map(a => ({ name: a.name, role: a.role, status: a.status })),
    }, null, 2), 'utf-8');
    fs.writeFileSync(path.join(squadDir, 'casting', 'history.json'), JSON.stringify({
        events: [{ date: new Date().toISOString(), event: 'Squad created', template: template.id }],
    }, null, 2), 'utf-8');
    // ── Agent directories with rich charters ──────────────────────────────
    for (const agent of template.agents) {
        const agentSlug = agent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const agentDir = path.join(squadDir, 'agents', agentSlug);
        fs.mkdirSync(agentDir, { recursive: true });
        const charter = (0, squadTemplates_1.generateCharter)(agent.name, agent.role, projectName);
        const history = (0, squadTemplates_1.generateHistory)(agent.name, agent.role, projectName);
        fs.writeFileSync(path.join(agentDir, 'charter.md'), charter, 'utf-8');
        fs.writeFileSync(path.join(agentDir, 'history.md'), history, 'utf-8');
    }
    await squadRegistry_1.squadRegistry.registerSquad(squadDir, targetFolder.uri.fsPath);
    vscode.window.showInformationMessage(`Squad: Created "${squadName}" (${template.label}) with ${template.agents.length} agents`);
}
//# sourceMappingURL=createSquad.js.map