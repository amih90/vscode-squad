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
exports.handleSearchSquads = handleSearchSquads;
const vscode = __importStar(require("vscode"));
const squadRegistry_1 = require("../core/squadRegistry");
async function handleSearchSquads() {
    const all = squadRegistry_1.squadRegistry.allContexts;
    if (all.length === 0) {
        vscode.window.showWarningMessage('No squads registered');
        return;
    }
    const query = await vscode.window.showInputBox({
        prompt: 'Search across squads',
        placeHolder: 'e.g., agent name, role, or keyword',
    });
    if (!query) {
        return;
    }
    const lowerQuery = query.toLowerCase();
    const results = [];
    for (const ctx of all) {
        const squadLabel = ctx.rootPath;
        for (const [name, agent] of ctx.agents) {
            if (name.toLowerCase().includes(lowerQuery) ||
                agent.role.toLowerCase().includes(lowerQuery)) {
                results.push(`[${squadLabel}] ${name} — ${agent.role}`);
            }
        }
    }
    const channel = vscode.window.createOutputChannel('Squad Search');
    channel.clear();
    if (results.length === 0) {
        channel.appendLine(`No results for "${query}".`);
    }
    else {
        channel.appendLine(`--- ${results.length} result(s) for "${query}" ---`);
        for (const r of results) {
            channel.appendLine(r);
        }
    }
    channel.show();
}
//# sourceMappingURL=searchSquads.js.map