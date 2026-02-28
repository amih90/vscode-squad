"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RingBuffer = void 0;
class RingBuffer {
    constructor(capacity) {
        this.head = 0;
        this.count = 0;
        if (capacity < 1) {
            throw new Error('RingBuffer capacity must be at least 1');
        }
        this.cap = capacity;
        this.buffer = new Array(capacity);
    }
    push(item) {
        this.buffer[this.head] = item;
        this.head = (this.head + 1) % this.cap;
        if (this.count < this.cap) {
            this.count++;
        }
    }
    get(index) {
        if (index < 0 || index >= this.count) {
            return undefined;
        }
        const realIndex = (this.head - this.count + index + this.cap) % this.cap;
        return this.buffer[realIndex];
    }
    /** Returns items oldest-first. */
    toArray() {
        const result = [];
        for (let i = 0; i < this.count; i++) {
            const realIndex = (this.head - this.count + i + this.cap) % this.cap;
            result.push(this.buffer[realIndex]);
        }
        return result;
    }
    get length() {
        return this.count;
    }
    get capacity() {
        return this.cap;
    }
    clear() {
        this.buffer = new Array(this.cap);
        this.head = 0;
        this.count = 0;
    }
    [Symbol.iterator]() {
        let i = 0;
        const self = this;
        return {
            next() {
                if (i < self.count) {
                    const value = self.get(i);
                    i++;
                    return { value, done: false };
                }
                return { value: undefined, done: true };
            },
        };
    }
}
exports.RingBuffer = RingBuffer;
//# sourceMappingURL=ringBuffer.js.map