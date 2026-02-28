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
const teamState_1 = require("../team/teamState");
const logger_1 = require("../utils/logger");
class TeamRosterProvider {
    constructor(initialState) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.state = initialState;
        (0, logger_1.log)('TeamRosterProvider initialized');
    }
    refresh() {
        const newState = (0, teamState_1.getTeamState)();
        if (newState) {
            this.state = newState;
        }
        (0, logger_1.log)('Tree view refreshed');
        this._onDidChangeTreeData.fire(null);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.state) {
            (0, logger_1.log)('No team state, returning empty children');
            return Promise.resolve([]);
        }
        if (!element) {
            // Root level: return sections
            return Promise.resolve([
                new RosterItem('Coordinator', 'Coordinator section', vscode.TreeItemCollapsibleState.Collapsed),
                new RosterItem('Members', 'Members section', vscode.TreeItemCollapsibleState.Collapsed),
                new RosterItem('Coding Agent', 'Coding Agent section', vscode.TreeItemCollapsibleState.Collapsed),
            ]);
        }
        // Child level: return members in section
        if (element.label === 'Coordinator' && this.state.coordinator) {
            return Promise.resolve([
                createMemberItem(this.state.coordinator),
            ]);
        }
        if (element.label === 'Members') {
            return Promise.resolve(this.state.members.map(createMemberItem));
        }
        if (element.label === 'Coding Agent' && this.state.codingAgent) {
            return Promise.resolve([
                createMemberItem(this.state.codingAgent),
            ]);
        }
        return Promise.resolve([]);
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
    constructor(label, tooltip, collapsibleState, parent, contextValue) {
        super(label, collapsibleState);
        this.label = label;
        this.tooltip = tooltip;
        this.collapsibleState = collapsibleState;
        this.parent = parent;
        this.contextValue = contextValue;
        this.tooltip = tooltip;
    }
}
exports.RosterItem = RosterItem;
function createMemberItem(member) {
    const contextValue = member.section === 'coordinator' ? 'coordinator' : 'member';
    return new RosterItem(member.name, `${member.name} - ${member.role}${member.status ? ` (${member.status})` : ''}`, vscode.TreeItemCollapsibleState.None, member.section === 'coordinator' ? 'Coordinator' : member.section === 'codingAgent' ? 'Coding Agent' : 'Members', contextValue);
}
//# sourceMappingURL=rosterTreeProvider.js.map