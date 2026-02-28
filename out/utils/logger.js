"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
exports.logError = logError;
function log(...args) {
    const timestamp = new Date().toISOString();
    console.log(`[squad] ${timestamp}`, ...args);
}
function logError(message, error) {
    const timestamp = new Date().toISOString();
    console.error(`[squad:error] ${timestamp}`, message, error);
}
//# sourceMappingURL=logger.js.map