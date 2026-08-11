import { GameDefinition, GameEngine, SystemClock } from '@soumya/game-engine-core';
import { InMemoryPersistence } from '@soumya/game-engine-persistence';
import { InventorySystem } from '@soumya/game-engine-inventory';
import { EconomySystem } from '@soumya/game-engine-economy';
import { ProductionSystem } from '@soumya/game-engine-production';
import { SkillSystem } from '@soumya/game-engine-progression';
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
