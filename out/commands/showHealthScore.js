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
exports.handleShowHealthScore = handleShowHealthScore;
const vscode = __importStar(require("vscode"));
const squadRegistry_1 = require("../core/squadRegistry");
const statsEngine_1 = require("../monitoring/statsEngine");
async function handleShowHealthScore() {
    const ctx = squadRegistry_1.squadRegistry.activeContext;
    if (!ctx) {
        vscode.window.showWarningMessage('No active squad');
        return;
    }
    const agents = [...ctx.agents.values()];
    const stats = statsEngine_1.statsEngine.getSquadStats(agents);
    const lines = [
        `Health Score: ${stats.healthScore}/100`,
        `Agents: ${stats.activeAgents}/${stats.totalAgents} active`,
        `Tasks: ${stats.completedTasks} completed, ${stats.failedTasks} failed`,
    ];
    vscode.window.showInformationMessage(`Squad Health — ${lines.join(' | ')}`);
}
//# sourceMappingURL=showHealthScore.js.map