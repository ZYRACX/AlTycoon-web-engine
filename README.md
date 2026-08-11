# Economic Game Engine

Reusable ES-module simulation primitives for persistent economy, tycoon, incremental, and management games. It has no UI, database, browser, or theme dependency.

## Quick start

```js
const engine = new GameEngine({ definition, clock, persistence })
  .use(new InventorySystem())
  .use(new EconomySystem())
  .use(new ProductionSystem());
await engine.initialize();
```

Run `npm install` then `npm test`. See [Factory Demo](examples/factory-demo/index.js), [API](docs/API.md), and [architecture](docs/ARCHITECTURE.md).

An application owns its game content and persistence implementation. The included `InMemoryPersistence` is designed for tests and demos only.
