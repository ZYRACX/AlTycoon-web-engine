import { EventBus } from './events.js';
import { SystemClock } from './time.js';
import { fail } from './errors.js';
export class GameSystem {
  initialize() {}
  start() {}
  shutdown() {}
}
export class GameEngine {
  constructor({ definition, clock = new SystemClock(), persistence, random }) {
    this.definition = definition;
    this.clock = clock;
    this.time = { clock, now: () => clock.now() };
    this.persistence = persistence;
    this.random = random;
    this.events = new EventBus();
    this.systems = [];
    this.commands = new Map();
    this.queries = new Map();
  }
  use(system) {
    this.systems.push(system);
    return this;
  }
  registerCommand(name, handler) {
    if (this.commands.has(name)) fail('DUPLICATE_COMMAND', `Command already registered: ${name}`);
    this.commands.set(name, handler);
  }
  registerQuery(name, handler) {
    this.queries.set(name, handler);
  }
  async initialize() {
    this.definition.validate();
    await this.persistence.initialize?.();
    for (const system of this.systems) await system.initialize(this);
  }
  async start() {
    for (const system of this.systems) await system.start(this);
  }
  async stop() {
    for (const system of [...this.systems].reverse()) await system.shutdown(this);
  }
  async execute(name, input) {
    const handler = this.commands.get(name);
    if (!handler) fail('UNKNOWN_COMMAND', `Unknown command: ${name}`);
    return this.transaction((tx) => handler(input, tx));
  }
  async query(name, input) {
    const handler = this.queries.get(name);
    if (!handler) fail('UNKNOWN_QUERY', `Unknown query: ${name}`);
    return handler(input);
  }
  async transaction(work) {
    return this.persistence.transaction
      ? this.persistence.transaction(work)
      : work(this.persistence);
  }
}
