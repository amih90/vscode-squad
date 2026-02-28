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
exports.handleOpenAgentDetail = handleOpenAgentDetail;
const vscode = __importStar(require("vscode"));
const agentDetailPanel_1 = require("../webview/agentDetailPanel");
const squadRegistry_1 = require("../core/squadRegistry");
async function handleOpenAgentDetail(context, agentName) {
    const ctx = squadRegistry_1.squadRegistry.activeContext;
    if (!ctx) {
        vscode.window.showWarningMessage('No active squad');
        return;
    }
    if (!agentName) {
        const names = [...ctx.agents.keys()];
        if (names.length === 0) {
            vscode.window.showWarningMessage('No agents in the active squad');
            return;
        }
        agentName = await vscode.window.showQuickPick(names, { placeHolder: 'Select an agent' });
    }
    if (agentName) {
        agentDetailPanel_1.AgentDetailPanel.createOrShow(context.extensionUri, agentName);
    }
}
//# sourceMappingURL=openAgentDetail.js.map