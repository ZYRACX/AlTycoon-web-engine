export const factoryDefinition = {
  currencies: [{ id: 'tokens', name: 'Tokens' }],
  items: [
    { id: 'wood', name: 'Wood', category: 'material', stackable: true, maxStackSize: 100 },
    { id: 'plank', name: 'Plank', category: 'product', stackable: true, maxStackSize: 100 },
  ],
  recipes: [
    {
      id: 'saw-plank',
      inputs: [{ itemId: 'wood', quantity: 2 }],
      outputs: [{ itemId: 'plank', quantity: 1 }],
      duration: 30000,
    },
  ],
  skills: [
    {
      id: 'workshop-basics',
      name: 'Workshop Basics',
      cost: 1,
      prerequisites: [],
      effects: [{ type: 'production_rate', operation: 'MULTIPLY', value: 1.1 }],
    },
  ],
  rules: { economy: { allowNegativeBalance: false } },
};
