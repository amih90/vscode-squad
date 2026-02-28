export declare class RingBuffer<T> {
    private buffer;
    private head;
    private count;
    private readonly cap;
    constructor(capacity: number);
    push(item: T): void;
    get(index: number): T | undefined;
    /** Returns items oldest-first. */
    toArray(): T[];
    get length(): number;
    get capacity(): number;
    clear(): void;
    [Symbol.iterator](): Iterator<T>;
}
//# sourceMappingURL=ringBuffer.d.ts.map