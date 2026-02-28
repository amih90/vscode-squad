"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTeamFile = parseTeamFile;
const logger_1 = require("../utils/logger");
/**
 * Parse markdown team file content into TeamState
 * @param content - Raw markdown file content
 * @param filePath - Path to the team file
 * @returns Parsed TeamState
 */
function parseTeamFile(content, filePath) {
    // TODO: Implement markdown parsing logic
    // Extract sections: Coordinator, Members, Coding Agent
    // Parse tables to extract member data
    (0, logger_1.log)('Parsing team file: ' + filePath);
    return {
        coordinator: null,
        members: [],
        codingAgent: null,
        filePath,
        lastModified: Date.now(),
    };
}
//# sourceMappingURL=parser.js.map