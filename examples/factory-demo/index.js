import { GameDefinition, GameEngine, SystemClock } from '@game-engine/core';
import { InMemoryPersistence } from '@game-engine/persistence';
import { InventorySystem } from '@game-engine/inventory';
import { EconomySystem } from '@game-engine/economy';
import { ProductionSystem } from '@game-engine/production';
import { SkillSystem } from '@game-engine/progression';
import { factoryDefinition } from './definition.js';
export const createFactoryDemo = async () => {
  const persistence = new InMemoryPersistence();
  const engine = new GameEngine({
    definition: new GameDefinition(factoryDefinition),
    clock: new SystemClock(),
    persistence,
  })
    .use(new InventorySystem())
    .use(new EconomySystem())
    .use(new ProductionSystem())
    .use(new SkillSystem());
  await engine.initialize();
  return engine;
};
