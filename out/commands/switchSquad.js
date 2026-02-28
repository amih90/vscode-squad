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
exports.handleSwitchSquad = handleSwitchSquad;
const vscode = __importStar(require("vscode"));
const squadRegistry_1 = require("../core/squadRegistry");
async function handleSwitchSquad(squadPath) {
    const all = squadRegistry_1.squadRegistry.allContexts;
    if (all.length === 0) {
        vscode.window.showWarningMessage('No squads registered');
        return;
    }
    if (!squadPath) {
        const items = all.map((ctx) => ({
            label: ctx.squadName,
            description: ctx.squadDir,
            squadDir: ctx.squadDir,
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a squad to activate',
        });
        if (!selected) {
            return;
        }
        squadPath = selected.squadDir;
    }
    squadRegistry_1.squadRegistry.setActiveSquad(squadPath);
    const ctx = squadRegistry_1.squadRegistry.getContext(squadPath);
    vscode.window.showInformationMessage(`Squad: Switched to "${ctx?.squadName ?? squadPath}"`);
}
//# sourceMappingURL=switchSquad.js.map