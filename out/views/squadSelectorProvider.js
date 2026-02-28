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
exports.SquadSelectorItem = exports.SquadSelectorProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const squadRegistry_1 = require("../core/squadRegistry");
class SquadSelectorProvider {
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
        const activePath = squadRegistry_1.squadRegistry.activeSquadPath;
        return squadRegistry_1.squadRegistry.allContexts.map((ctx) => {
            const isActive = ctx.rootPath === activePath;
            return createSquadItem(ctx, isActive);
        });
    }
}
exports.SquadSelectorProvider = SquadSelectorProvider;
function deriveLabel(ctx, isActive) {
    const description = ctx.teamState.projectContext?.description;
    const name = description ?? path.basename(ctx.rootPath);
    return isActive ? `★ ${name}` : name;
}
function createSquadItem(ctx, isActive) {
    const label = deriveLabel(ctx, isActive);
    const agentCount = ctx.agents.size;
    return new SquadSelectorItem(label, ctx.rootPath, isActive, agentCount);
}
class SquadSelectorItem extends vscode.TreeItem {
    constructor(label, squadPath, isActive, agentCount) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.squadPath = squadPath;
        this.isActive = isActive;
        this.description = isActive ? `(active) · ${agentCount} agents` : `${agentCount} agents`;
        this.tooltip = squadPath;
        this.contextValue = isActive ? 'activeSquad' : 'squad';
        this.command = {
            command: 'squad.switchSquad',
            title: 'Switch Squad',
            arguments: [squadPath],
        };
        this.iconPath = isActive
            ? new vscode.ThemeIcon('star-full')
            : new vscode.ThemeIcon('folder');
    }
}
exports.SquadSelectorItem = SquadSelectorItem;
//# sourceMappingURL=squadSelectorProvider.js.map