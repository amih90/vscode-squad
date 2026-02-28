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
exports.setupWatcher = setupWatcher;
exports.markInternalChange = markInternalChange;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const logger_1 = require("../utils/logger");
const teamState_1 = require("./teamState");
let isInternalChange = false;
/**
 * Setup file watcher for team.md in a squad directory
 * @param squadDir - Root directory of the squad (containing team.md)
 * @param treeProvider - Tree provider to refresh on changes
 * @returns Disposable watcher
 */
function setupWatcher(squadDir, treeProvider) {
    const teamFilePath = path.join(squadDir, 'team.md');
    if (!fs.existsSync(teamFilePath)) {
        (0, logger_1.log)('Team file does not exist, skipping watcher setup');
        return new vscode.Disposable(() => { });
    }
    (0, logger_1.log)('Setting up file watcher for', teamFilePath);
    const watcher = fs.watch(teamFilePath, async (eventType) => {
        if (eventType === 'change' && !isInternalChange) {
            (0, logger_1.log)('Team file changed externally');
            await (0, teamState_1.loadTeamState)(squadDir);
            treeProvider?.refresh();
            vscode.window.showInformationMessage('Team roster updated from disk');
        }
    });
    return new vscode.Disposable(() => {
        watcher.close();
        (0, logger_1.log)('File watcher closed');
    });
}
/**
 * Mark the next file change as internal (don't reload)
 */
function markInternalChange() {
    isInternalChange = true;
    setTimeout(() => {
        isInternalChange = false;
    }, 500);
}
//# sourceMappingURL=watcher.js.map