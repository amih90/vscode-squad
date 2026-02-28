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
exports.handleRunCeremony = handleRunCeremony;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const squadRegistry_1 = require("../core/squadRegistry");
async function handleRunCeremony() {
    const ctx = squadRegistry_1.squadRegistry.activeContext;
    if (!ctx) {
        vscode.window.showWarningMessage('No active squad');
        return;
    }
    const ceremoniesPath = path.join(ctx.squadDir, 'ceremonies.md');
    let ceremonies = ['Standup', 'Sprint Planning', 'Design Review', 'Retro'];
    if (fs.existsSync(ceremoniesPath)) {
        const content = fs.readFileSync(ceremoniesPath, 'utf-8');
        const headerMatches = content.match(/^##\s+(.+)$/gm);
        if (headerMatches && headerMatches.length > 0) {
            ceremonies = headerMatches.map((h) => h.replace(/^##\s+/, ''));
        }
    }
    const selected = await vscode.window.showQuickPick(ceremonies, {
        placeHolder: 'Select a ceremony to run',
    });
    if (!selected) {
        return;
    }
    const agents = [...ctx.agents.values()];
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();
    let output = '';
    switch (selected.toLowerCase()) {
        case 'standup': {
            output = `# Standup — ${date}\n\n**Time:** ${time}\n**Attendees:** ${agents.map(a => a.name).join(', ')}\n\n`;
            for (const agent of agents) {
                output += `## ${agent.name} (${agent.role})\n`;
                output += `- **Status:** ${agent.status}\n`;
                output += `- **Yesterday:** \n`;
                output += `- **Today:** \n`;
                output += `- **Blockers:** \n\n`;
            }
            break;
        }
        case 'retro': {
            output = `# Retrospective — ${date}\n\n**Time:** ${time}\n\n`;
            output += `## What Went Well\n- \n\n## What Could Improve\n- \n\n## Action Items\n| Item | Owner | Due |\n|------|-------|-----|\n| | | |\n`;
            break;
        }
        case 'sprint planning': {
            output = `# Sprint Planning — ${date}\n\n**Time:** ${time}\n**Squad:** ${ctx.teamState.projectContext?.description ?? 'Squad'}\n\n`;
            output += `## Sprint Goal\n(define sprint goal)\n\n## Task Assignments\n\n`;
            for (const agent of agents) {
                output += `### ${agent.name} (${agent.role})\n- [ ] \n\n`;
            }
            break;
        }
        case 'design review': {
            output = `# Design Review — ${date}\n\n**Time:** ${time}\n**Reviewer:** \n\n`;
            output += `## Design Under Review\n(describe the design)\n\n## Feedback\n\n`;
            for (const agent of agents) {
                output += `### ${agent.name}\n- \n\n`;
            }
            output += `## Decision\n- [ ] Approved\n- [ ] Approved with changes\n- [ ] Needs revision\n`;
            break;
        }
        default: {
            output = `# ${selected} — ${date}\n\n**Time:** ${time}\n\n## Notes\n- \n`;
            break;
        }
    }
    // Write ceremony output
    const slug = selected.toLowerCase().replace(/\s+/g, '-');
    const outputDir = path.join(ctx.squadDir, 'ceremonies');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, `${slug}-${date}.md`);
    fs.writeFileSync(outputPath, output, 'utf-8');
    const doc = await vscode.workspace.openTextDocument(outputPath);
    await vscode.window.showTextDocument(doc, { preview: false });
    vscode.window.showInformationMessage(`Squad: Created ${selected} notes`);
}
//# sourceMappingURL=runCeremony.js.map