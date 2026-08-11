import { GameSystem, fail } from '@game-engine/core';
const positive = (quantity) => {
  if (!Number.isFinite(quantity) || quantity <= 0)
    fail('INVALID_QUANTITY', 'Quantity must be greater than zero', { quantity });
};
export class InventorySystem extends GameSystem {
  initialize(engine) {
    this.engine = engine;
    engine.inventory = this;
    engine.registerCommand('inventory.add', (x, tx) =>
      this.add(x.ownerId, x.itemId, x.quantity, tx),
    );
    engine.registerQuery('player.inventory', ({ playerId }) => this.getAll(playerId));
  }
  async assertOwner(ownerId) {
    if (!(await this.engine.persistence.hasPlayer(ownerId)))
      fail('ENTITY_NOT_FOUND', 'Owner does not exist', { ownerId });
  }
  item(itemId) {
    const item = this.engine.definition.getItem(itemId);
    if (!item) fail('ITEM_NOT_FOUND', 'Item does not exist', { itemId });
    return item;
  }
  async add(ownerId, itemId, quantity, repo = this.engine.persistence) {
    positive(quantity);
    await this.assertOwner(ownerId);
    const item = this.item(itemId);
    const current = await repo.getItemQuantity(ownerId, itemId);
    const maximum = item.maxStackSize ?? Infinity;
    if (current + quantity > maximum)
      fail('STACK_LIMIT_EXCEEDED', 'Item stack limit exceeded', { itemId, maximum });
    await repo.setItemQuantity(ownerId, itemId, current + quantity);
    await this.engine.events.emit('inventory.changed', {
      ownerId,
      itemId,
      quantity,
      operation: 'add',
    });
    return current + quantity;
  }
  async remove(ownerId, itemId, quantity, repo = this.engine.persistence) {
    positive(quantity);
    await this.assertOwner(ownerId);
    this.item(itemId);
    const current = await repo.getItemQuantity(ownerId, itemId);
    if (current < quantity)
      fail('INSUFFICIENT_ITEM', 'Insufficient item quantity', {
        itemId,
        required: quantity,
        available: current,
      });
    await repo.setItemQuantity(ownerId, itemId, current - quantity);
    await this.engine.events.emit('inventory.changed', {
      ownerId,
      itemId,
      quantity,
      operation: 'remove',
    });
    return current - quantity;
  }
  async has(ownerId, itemId, quantity) {
    positive(quantity);
    return (await this.engine.persistence.getItemQuantity(ownerId, itemId)) >= quantity;
  }
  get(ownerId, itemId) {
    return this.engine.persistence.getItemQuantity(ownerId, itemId);
  }
  getAll(ownerId) {
    return this.engine.persistence.getInventory(ownerId);
  }
}
