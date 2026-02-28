"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = void 0;
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    on(event, callback) {
        let set = this.listeners.get(event);
        if (!set) {
            set = new Set();
            this.listeners.set(event, set);
        }
        set.add(callback);
    }
    off(event, callback) {
        const set = this.listeners.get(event);
        if (set) {
            set.delete(callback);
            if (set.size === 0) {
                this.listeners.delete(event);
            }
        }
    }
    emit(event, data) {
        const set = this.listeners.get(event);
        if (set) {
            for (const callback of set) {
                callback(data);
            }
        }
    }
    dispose() {
        this.listeners.clear();
    }
}
exports.eventBus = new EventBus();
//# sourceMappingURL=eventBus.js.map