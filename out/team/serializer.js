"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeTeamFile = serializeTeamFile;
const logger_1 = require("../utils/logger");
/**
 * Serialize a single member row for the markdown table.
 * Charter column now emits the `.squad/agents/{slug}/charter.md` path.
 */
function memberRow(m) {
    const slug = m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const charter = m.charter || `.squad/agents/${slug}/charter.md`;
    const status = m.status ?? '✅ Active';
    const notes = m.notes ?? '';
    return `| ${m.name} | ${m.role} | ${charter} | ${status} | ${notes} |`;
}
/**
 * Serialize the project context section.
 */
function serializeProjectContext(ctx) {
    if (!ctx) {
        return '';
    }
    const lines = ['## Project Context', ''];
    if (ctx.description) {
        lines.push(`- **Building:** ${ctx.description}`);
    }
    if (ctx.techStack) {
        lines.push(`- **Tech Stack:** ${ctx.techStack}`);
    }
    if (ctx.user) {
        lines.push(`- **User:** ${ctx.user}`);
    }
    lines.push('');
    return lines.join('\n');
}
/**
 * Collect all members (coordinator + members + codingAgent) preserving order.
 */
function gatherAllMembers(state) {
    const all = [];
    if (state.coordinator) {
        all.push(state.coordinator);
    }
    all.push(...state.members);
    if (state.codingAgent) {
        all.push(state.codingAgent);
    }
    return all;
}
/**
 * Preserve any content before `## Project Context` or `## Members` (e.g. the title).
 * If the original content has a title line we keep it; otherwise use a default.
 */
function extractTitle(originalContent) {
    if (!originalContent) {
        return '# Team Roster';
    }
    const lines = originalContent.split('\n');
    for (const line of lines) {
        if (line.startsWith('# ')) {
            return line;
        }
    }
    return '# Team Roster';
}
/**
 * Serialize TeamState into markdown format for .squad/team.md
 * @param state - Current team state
 * @param originalContent - Optional original file content to preserve title and project context
 * @returns Markdown string ready to write to file
 */
function serializeTeamFile(state, originalContent) {
    (0, logger_1.log)('Serializing team state');
    const title = extractTitle(originalContent);
    const parts = [title, ''];
    // Project context
    const ctxBlock = serializeProjectContext(state.projectContext);
    if (ctxBlock) {
        parts.push(ctxBlock);
    }
    // Members table
    const allMembers = gatherAllMembers(state);
    parts.push('## Members', '');
    parts.push('| Name | Role | Charter | Status | Notes |');
    parts.push('|------|------|---------|--------|-------|');
    for (const m of allMembers) {
        parts.push(memberRow(m));
    }
    parts.push('');
    return parts.join('\n');
}
//# sourceMappingURL=serializer.js.map