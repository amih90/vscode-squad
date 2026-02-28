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
exports.handleRunCeremony = handleRunCeremony;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const squadRegistry_1 = require("../core/squadRegistry");
async function handleRunCeremony() {
    const ctx = squadRegistry_1.squadRegistry.activeContext;
    if (!ctx) {
        vscode.window.showWarningMessage('No active squad');
        return;
    }
    const ceremoniesPath = path.join(ctx.rootPath, '.squad', 'ceremonies.md');
    let ceremonies = ['Design Review', 'Retro', 'Standup', 'Sprint Planning'];
    if (fs.existsSync(ceremoniesPath)) {
        const content = fs.readFileSync(ceremoniesPath, 'utf-8');
        const headerMatches = content.match(/^##\s+(.+)$/gm);
        if (headerMatches && headerMatches.length > 0) {
            ceremonies = headerMatches.map((h) => h.replace(/^##\s+/, ''));
        }
    }
    const selected = await vscode.window.showQuickPick(ceremonies, {
        placeHolder: 'Select a ceremony to run',
    });
    if (!selected) {
        return;
    }
    vscode.window.showInformationMessage(`Squad: Starting ceremony "${selected}"`);
}
//# sourceMappingURL=runCeremony.js.map