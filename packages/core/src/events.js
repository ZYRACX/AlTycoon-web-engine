export class EventBus {
  #handlers = new Map();
  on(name, handler) {
    const handlers = this.#handlers.get(name) ?? new Set();
    handlers.add(handler);
    this.#handlers.set(name, handlers);
    return () => handlers.delete(handler);
  }
  async emit(name, payload) {
    for (const handler of this.#handlers.get(name) ?? []) await handler(payload);
  }
}
