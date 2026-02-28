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
exports.handleFilterLogs = handleFilterLogs;
const vscode = __importStar(require("vscode"));
const logStore_1 = require("../monitoring/logStore");
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];
async function handleFilterLogs() {
    const level = await vscode.window.showQuickPick(LOG_LEVELS, {
        placeHolder: 'Select log level to filter by',
    });
    if (!level) {
        return;
    }
    const entries = logStore_1.logStore.getEntries({ level });
    const channel = vscode.window.createOutputChannel('Squad Logs (Filtered)');
    channel.clear();
    if (entries.length === 0) {
        channel.appendLine(`No log entries at level "${level}".`);
    }
    else {
        channel.appendLine(`--- Showing ${entries.length} entries at level: ${level} ---`);
        for (const entry of entries) {
            const time = new Date(entry.timestamp).toISOString();
            channel.appendLine(`[${time}] [${entry.agentName}] ${entry.message}`);
        }
    }
    channel.show();
}
//# sourceMappingURL=filterLogs.js.map