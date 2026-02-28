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
exports.RosterItem = exports.TeamRosterProvider = void 0;
const vscode = __importStar(require("vscode"));
const squadRegistry_1 = require("../core/squadRegistry");
class TeamRosterProvider {
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
        const ctx = squadRegistry_1.squadRegistry.activeContext;
        if (!ctx) {
            return [];
        }
        const { teamState, agents } = ctx;
        if (!element) {
            return [
                new RosterItem('Coordinator', 'Coordinator section', vscode.TreeItemCollapsibleState.Collapsed),
                new RosterItem('Members', 'Members section', vscode.TreeItemCollapsibleState.Collapsed),
                new RosterItem('Coding Agent', 'Coding Agent section', vscode.TreeItemCollapsibleState.Collapsed),
            ];
        }
        if (element.label === 'Coordinator' && teamState.coordinator) {
            return [createMemberItem(teamState.coordinator, agents)];
        }
        if (element.label === 'Members') {
            return teamState.members.map((m) => createMemberItem(m, agents));
        }
        if (element.label === 'Coding Agent' && teamState.codingAgent) {
            return [createMemberItem(teamState.codingAgent, agents)];
        }
        return [];
    }
    getParent(element) {
        if (element.parent) {
            return new RosterItem(element.parent, `${element.parent} section`, vscode.TreeItemCollapsibleState.Collapsed);
        }
        return null;
    }
}
exports.TeamRosterProvider = TeamRosterProvider;
class RosterItem extends vscode.TreeItem {
    constructor(label, tooltip, collapsibleState, parent, contextValue, description) {
        super(label, collapsibleState);
        this.parent = parent;
        this.tooltip = tooltip;
        this.contextValue = contextValue;
        if (description) {
            this.description = description;
        }
    }
}
exports.RosterItem = RosterItem;
function resolveContextValue(member) {
    if (member.section === 'coordinator') {
        return 'coordinator';
    }
    if (member.section === 'codingAgent') {
        return 'codingAgent';
    }
    const lower = member.name.toLowerCase();
    if (lower === 'scribe') {
        return 'scribe';
    }
    if (lower === 'ralph') {
        return 'ralph';
    }
    return 'member';
}
function parentLabel(member) {
    if (member.section === 'coordinator') {
        return 'Coordinator';
    }
    if (member.section === 'codingAgent') {
        return 'Coding Agent';
    }
    return 'Members';
}
function createMemberItem(member, agents) {
    const runtime = agents.get(member.name);
    const emoji = runtime?.emoji ?? member.notes ?? '👤';
    const label = `${emoji} ${member.name}`;
    const status = runtime?.status ?? member.status ?? 'idle';
    const tooltip = `${member.name} - ${member.role} (${status})`;
    const contextValue = resolveContextValue(member);
    return new RosterItem(label, tooltip, vscode.TreeItemCollapsibleState.None, parentLabel(member), contextValue, member.role);
}
//# sourceMappingURL=rosterTreeProvider.js.map