export class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private count = 0;
  private readonly cap: number;

  constructor(capacity: number) {
    if (capacity < 1) {
      throw new Error('RingBuffer capacity must be at least 1');
    }
    this.cap = capacity;
    this.buffer = new Array<T | undefined>(capacity);
  }

  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.cap;
    if (this.count < this.cap) {
      this.count++;
    }
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined;
    }
    const realIndex = (this.head - this.count + index + this.cap) % this.cap;
    return this.buffer[realIndex];
  }

  /** Returns items oldest-first. */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const realIndex = (this.head - this.count + i + this.cap) % this.cap;
      result.push(this.buffer[realIndex] as T);
    }
    return result;
  }

  get length(): number {
    return this.count;
  }

  get capacity(): number {
    return this.cap;
  }

  clear(): void {
    this.buffer = new Array<T | undefined>(this.cap);
    this.head = 0;
    this.count = 0;
  }

  [Symbol.iterator](): Iterator<T> {
    let i = 0;
    const self = this;
    return {
      next(): IteratorResult<T> {
        if (i < self.count) {
          const value = self.get(i) as T;
          i++;
          return { value, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}
