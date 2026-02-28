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
exports.handleOpenTeamFile = handleOpenTeamFile;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger");
const squadRegistry_1 = require("../core/squadRegistry");
async function handleOpenTeamFile(context) {
    (0, logger_1.log)('Command: squad.openTeamFile called');
    const workspaceRoot = squadRegistry_1.squadRegistry.activeContext?.rootPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showWarningMessage('No workspace folder open');
        return;
    }
    const teamFilePath = path.join(workspaceRoot, '.squad', 'team.md');
    const teamFileUri = vscode.Uri.file(teamFilePath);
    try {
        const doc = await vscode.workspace.openTextDocument(teamFileUri);
        await vscode.window.showTextDocument(doc);
    }
    catch (err) {
        (0, logger_1.log)('Error opening team file:', err);
        vscode.window.showErrorMessage('Squad: Failed to open team file');
    }
}
//# sourceMappingURL=openTeamFile.js.map