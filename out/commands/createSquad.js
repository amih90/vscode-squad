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
const TEAM_TEMPLATE = `# Squad Team

## Project Context
- **Project:** (your project name)
- **Stack:** (your tech stack)
- **Lead:** (your name)

## Members

| Name | Role | Charter | Badge |
|------|------|---------|-------|
`;
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
    const squadDir = path.join(targetFolder.uri.fsPath, '.squad');
    if (fs.existsSync(squadDir)) {
        vscode.window.showWarningMessage('A .squad directory already exists in this folder');
        return;
    }
    fs.mkdirSync(squadDir, { recursive: true });
    fs.writeFileSync(path.join(squadDir, 'team.md'), TEAM_TEMPLATE, 'utf-8');
    fs.mkdirSync(path.join(squadDir, 'agents'), { recursive: true });
    fs.mkdirSync(path.join(squadDir, 'decisions'), { recursive: true });
    fs.writeFileSync(path.join(squadDir, 'decisions.md'), '# Decisions\n', 'utf-8');
    await squadRegistry_1.squadRegistry.registerSquad(targetFolder.uri.fsPath);
    vscode.window.showInformationMessage(`Squad: Created .squad in ${targetFolder.name}`);
}
//# sourceMappingURL=createSquad.js.map