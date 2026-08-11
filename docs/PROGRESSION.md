# Progression

Skills define a cost, prerequisites, and generic effects. The engine validates prerequisite ownership and records unlocks; a game interprets effects by feeding them to its modifier calculations. `resolveModifiers` supports ADD, SUBTRACT, MULTIPLY, DIVIDE, and SET in declared order.
