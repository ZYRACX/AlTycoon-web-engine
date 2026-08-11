import { describe, expect, it, beforeEach } from 'vitest';
import { GameDefinition, GameEngine, MockClock, EngineError } from '@game-engine/core';
import { InMemoryPersistence } from '@game-engine/persistence';
import { InventorySystem } from '@game-engine/inventory';
import { EconomySystem } from '@game-engine/economy';
import { ProductionSystem, calculateOfflineProduction } from '@game-engine/production';
import { SkillSystem } from '@game-engine/progression';
import { resolveModifiers } from '@game-engine/modifiers';
const definition = new GameDefinition({
  currencies: [{ id: 'credit', name: 'Credit' }],
  items: [
    { id: 'input', name: 'Input', maxStackSize: 5 },
    { id: 'output', name: 'Output', maxStackSize: 10 },
  ],
  recipes: [
    {
      id: 'make',
      inputs: [{ itemId: 'input', quantity: 2 }],
      outputs: [{ itemId: 'output', quantity: 1 }],
      duration: 1000,
    },
  ],
  skills: [
    { id: 'first', cost: 1 },
    { id: 'second', cost: 2, prerequisites: ['first'] },
  ],
  rules: { economy: { allowNegativeBalance: false } },
});
let engine;
let store;
let clock;
beforeEach(async () => {
  store = new InMemoryPersistence();
  clock = new MockClock(100);
  engine = new GameEngine({ definition, clock, persistence: store })
    .use(new InventorySystem())
    .use(new EconomySystem())
    .use(new ProductionSystem())
    .use(new SkillSystem());
  await engine.initialize();
  await store.createPlayer('a');
  await store.createPlayer('b');
});
describe('inventory', () => {
  it('adds, removes, and enforces limits', async () => {
    await engine.inventory.add('a', 'input', 4);
    expect(await engine.inventory.get('a', 'input')).toBe(4);
    await engine.inventory.remove('a', 'input', 2);
    expect(await engine.inventory.get('a', 'input')).toBe(2);
    await expect(engine.inventory.remove('a', 'input', 3)).rejects.toMatchObject({
      code: 'INSUFFICIENT_ITEM',
    });
    await expect(engine.inventory.add('a', 'input', 4)).rejects.toMatchObject({
      code: 'STACK_LIMIT_EXCEEDED',
    });
    await expect(engine.inventory.add('a', 'input', -1)).rejects.toMatchObject({
      code: 'INVALID_QUANTITY',
    });
  });
});
describe('economy', () => {
  it('credits, debits, transfers, and records transactions', async () => {
    await engine.economy.credit('a', 'credit', 10, 'grant');
    await engine.economy.debit('a', 'credit', 4, 'cost');
    await engine.economy.transfer('a', 'b', 'credit', 3, 'gift');
    expect(await engine.economy.getBalance('a', 'credit')).toBe(3);
    expect(await engine.economy.getBalance('b', 'credit')).toBe(3);
    expect(store.transactions).toHaveLength(4);
    await expect(engine.economy.debit('a', 'credit', 4, 'cost')).rejects.toMatchObject({
      code: 'INSUFFICIENT_FUNDS',
    });
  });
});
describe('production and time', () => {
  it('consumes inputs and completes only after server time advances', async () => {
    await engine.inventory.add('a', 'input', 2);
    const job = await engine.production.start('a', 'make');
    expect(await engine.inventory.get('a', 'input')).toBe(0);
    await expect(engine.production.complete(job.id)).rejects.toMatchObject({
      code: 'JOB_NOT_COMPLETE',
    });
    clock.advance(1000);
    await engine.production.complete(job.id);
    expect(await engine.inventory.get('a', 'output')).toBe(1);
  });
  it('calculates offline output deterministically', () =>
    expect(
      calculateOfflineProduction({
        lastProcessedAt: 10,
        currentTime: 20,
        productionRate: 2,
        capacity: 15,
      }),
    ).toBe(15));
});
describe('skills, modifiers, and atomicity', () => {
  it('requires prerequisites and resolves modifiers in order', async () => {
    expect(await engine.skills.canUnlock('a', 'second', 2)).toBe(false);
    await engine.skills.unlock('a', 'first', 1);
    expect(await engine.skills.canUnlock('a', 'second', 2)).toBe(true);
    expect(
      resolveModifiers(100, [
        { operation: 'ADD', value: 10 },
        { operation: 'MULTIPLY', value: 2 },
      ]),
    ).toBe(220);
  });
  it('rolls back failed multi-step work', async () => {
    await engine.economy.credit('a', 'credit', 5, 'grant');
    await expect(
      engine.transaction(async (tx) => {
        await engine.economy.debit('a', 'credit', 5, 'cost', tx);
        throw new EngineError('FAIL', 'forced');
      }),
    ).rejects.toMatchObject({ code: 'FAIL' });
    expect(await engine.economy.getBalance('a', 'credit')).toBe(5);
  });
});
