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
exports.handleDeleteSquad = handleDeleteSquad;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const squadRegistry_1 = require("../core/squadRegistry");
async function handleDeleteSquad() {
    const all = squadRegistry_1.squadRegistry.allContexts;
    if (all.length === 0) {
        vscode.window.showWarningMessage('No squads registered');
        return;
    }
    const items = all.map((ctx) => ({
        label: ctx.rootPath,
        description: ctx.rootPath,
        rootPath: ctx.rootPath,
    }));
    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select squad to delete',
    });
    if (!selected) {
        return;
    }
    const confirm = await vscode.window.showWarningMessage(`Delete .squad directory at ${selected.rootPath}? This cannot be undone.`, { modal: true }, 'Delete');
    if (confirm !== 'Delete') {
        return;
    }
    squadRegistry_1.squadRegistry.unregisterSquad(selected.rootPath);
    const squadDir = path.join(selected.rootPath, '.squad');
    if (fs.existsSync(squadDir)) {
        fs.rmSync(squadDir, { recursive: true, force: true });
    }
    vscode.window.showInformationMessage('Squad: Deleted .squad directory');
}
//# sourceMappingURL=deleteSquad.js.map