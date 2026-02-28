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
exports.handleEditMember = handleEditMember;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../utils/logger");
async function handleEditMember(context, rosterProvider) {
    (0, logger_1.log)('Command: squad.editMember called');
    const memberName = await vscode.window.showInputBox({
        prompt: 'Enter the name of the member to edit',
    });
    if (!memberName) {
        return;
    }
    const newRole = await vscode.window.showInputBox({
        prompt: 'Enter new role',
        placeHolder: 'e.g., Frontend Dev',
    });
    if (!newRole) {
        return;
    }
    vscode.window.showInformationMessage(`Squad: Will update ${memberName} to ${newRole}`);
    // TODO: Implement actual edit member logic
    if (rosterProvider) {
        rosterProvider.refresh();
    }
}
//# sourceMappingURL=editMember.js.map