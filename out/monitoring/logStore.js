"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logStore = void 0;
const ringBuffer_1 = require("../core/ringBuffer");
const eventBus_1 = require("../core/eventBus");
let idCounter = 0;
function nextId() {
    return `log-${Date.now()}-${++idCounter}`;
}
class LogStore {
    constructor(capacity = 1000) {
        this.buffer = new ringBuffer_1.RingBuffer(capacity);
    }
    addEntry(entry) {
        const full = { ...entry, id: nextId() };
        this.buffer.push(full);
        eventBus_1.eventBus.emit('log-entry', { entry: full });
        return full;
    }
    getEntries(filter) {
        let entries = this.buffer.toArray();
        if (!filter) {
            return entries;
        }
        if (filter.agent) {
            entries = entries.filter((e) => e.agentName === filter.agent);
        }
        if (filter.level) {
            entries = entries.filter((e) => e.level === filter.level);
        }
        if (filter.since !== undefined) {
            entries = entries.filter((e) => e.timestamp >= filter.since);
        }
        return entries;
    }
    getEntriesForAgent(agentName) {
        return this.getEntries({ agent: agentName });
    }
    clear() {
        this.buffer.clear();
    }
}
exports.logStore = new LogStore();
//# sourceMappingURL=logStore.js.map