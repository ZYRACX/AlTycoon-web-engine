import { GameSystem, fail } from '@soumya/game-engine-core';
export const resolveModifiers = (base, modifiers = []) =>
  modifiers.reduce((value, modifier) => {
    switch (modifier.operation) {
      case 'ADD':
        return value + modifier.value;
      case 'SUBTRACT':
        return value - modifier.value;
      case 'MULTIPLY':
        return value * modifier.value;
      case 'DIVIDE':
        if (modifier.value === 0) fail('INVALID_MODIFIER', 'Cannot divide by zero');
        return value / modifier.value;
      case 'SET':
        return modifier.value;
      default:
        fail('INVALID_MODIFIER', 'Unknown modifier operation', { operation: modifier.operation });
    }
  }, base);
export class ModifierSystem extends GameSystem {
  initialize(engine) {
    engine.modifiers = this;
  }
  resolve(base, modifiers) {
    return resolveModifiers(base, modifiers);
  }
}
