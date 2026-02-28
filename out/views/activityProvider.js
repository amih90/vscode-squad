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
exports.ActivityItem = exports.ActivityProvider = void 0;
const vscode = __importStar(require("vscode"));
const logStore_1 = require("../monitoring/logStore");
const commandQueue_1 = require("../monitoring/commandQueue");
const MAX_ITEMS = 50;
const MAX_LABEL_LENGTH = 80;
class ActivityProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return [];
        }
        const logItems = logStore_1.logStore.getEntries().map(logEntryToItem);
        const cmdItems = commandQueue_1.commandQueueManager.getQueue().map(commandToItem);
        const merged = [...logItems, ...cmdItems]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, MAX_ITEMS);
        return merged;
    }
}
exports.ActivityProvider = ActivityProvider;
function truncate(text, max) {
    if (text.length <= max) {
        return text;
    }
    return text.slice(0, max - 1) + '…';
}
function logLevelIcon(level) {
    switch (level) {
        case 'error': return 'error';
        case 'warn': return 'warning';
        case 'debug': return 'debug-alt';
        case 'info':
        default: return 'info';
    }
}
function commandStatusIcon(status) {
    switch (status) {
        case 'queued': return 'clock';
        case 'running': return 'sync~spin';
        case 'completed': return 'check';
        case 'failed': return 'x';
    }
}
function formatTimestamp(ts) {
    return new Date(ts).toLocaleTimeString();
}
function logEntryToItem(entry) {
    const label = truncate(entry.message, MAX_LABEL_LENGTH);
    const description = entry.agentName;
    const tooltip = `[${formatTimestamp(entry.timestamp)}] ${entry.agentName}: ${entry.message}`;
    const iconId = logLevelIcon(entry.level);
    return new ActivityItem(label, description, tooltip, iconId, entry.timestamp);
}
function commandToItem(item) {
    const label = truncate(item.command, MAX_LABEL_LENGTH);
    const description = `${item.agentName} · ${item.status}`;
    const tooltip = `[${formatTimestamp(item.createdAt)}] ${item.agentName}: ${item.command} (${item.status})`;
    const iconId = commandStatusIcon(item.status);
    return new ActivityItem(label, description, tooltip, iconId, item.createdAt);
}
class ActivityItem extends vscode.TreeItem {
    constructor(label, description, tooltip, iconId, timestamp) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.timestamp = timestamp;
        this.description = description;
        this.tooltip = tooltip;
        this.iconPath = new vscode.ThemeIcon(iconId);
    }
}
exports.ActivityItem = ActivityItem;
//# sourceMappingURL=activityProvider.js.map