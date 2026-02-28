"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandQueueManager = void 0;
const eventBus_1 = require("../core/eventBus");
let idCounter = 0;
function nextId() {
    return `cmd-${Date.now()}-${++idCounter}`;
}
class CommandQueueManager {
    constructor() {
        this.queue = [];
    }
    enqueue(agentName, command, args) {
        const item = {
            id: nextId(),
            agentName,
            command,
            args: args ?? [],
            status: 'queued',
            createdAt: Date.now(),
        };
        this.queue.push(item);
        eventBus_1.eventBus.emit('command-queued', { item });
        return item;
    }
    markRunning(id) {
        const item = this.queue.find((i) => i.id === id);
        if (item) {
            item.status = 'running';
            item.startedAt = Date.now();
        }
    }
    markCompleted(id, result) {
        const item = this.queue.find((i) => i.id === id);
        if (item) {
            item.status = 'completed';
            item.completedAt = Date.now();
            item.result = result;
            eventBus_1.eventBus.emit('command-completed', { id, result: 'success' });
        }
    }
    markFailed(id, error) {
        const item = this.queue.find((i) => i.id === id);
        if (item) {
            item.status = 'failed';
            item.completedAt = Date.now();
            item.error = error;
            eventBus_1.eventBus.emit('command-completed', { id, result: 'failure' });
        }
    }
    getQueue() {
        return [...this.queue];
    }
    getQueueForAgent(agentName) {
        return this.queue.filter((i) => i.agentName === agentName);
    }
    getPending() {
        return this.queue.filter((i) => i.status === 'queued' || i.status === 'running');
    }
    clearCompleted() {
        this.queue = this.queue.filter((i) => i.status !== 'completed');
    }
}
exports.commandQueueManager = new CommandQueueManager();
//# sourceMappingURL=commandQueue.js.map