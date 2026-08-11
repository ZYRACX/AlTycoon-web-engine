import { GameSystem, fail } from '@soumya/game-engine-core';
const validAmount = (amount) => {
  if (!Number.isFinite(amount) || amount <= 0)
    fail('INVALID_AMOUNT', 'Amount must be greater than zero', { amount });
};
export class EconomySystem extends GameSystem {
  initialize(engine) {
    this.engine = engine;
    engine.economy = this;
  }
  currency(id) {
    const currency = this.engine.definition.getCurrency(id);
    if (!currency) fail('CURRENCY_NOT_FOUND', 'Currency does not exist', { currencyId: id });
    return currency;
  }
  getBalance(ownerId, currencyId) {
    return this.engine.persistence.getBalance(ownerId, currencyId);
  }
  async credit(ownerId, currencyId, amount, reason, repo = this.engine.persistence) {
    validAmount(amount);
    this.currency(currencyId);
    const value = (await repo.getBalance(ownerId, currencyId)) + amount;
    await repo.setBalance(ownerId, currencyId, value);
    await this.record('CREDIT', ownerId, currencyId, amount, reason, repo);
    await this.engine.events.emit('currency.credited', { ownerId, currencyId, amount, reason });
    return value;
  }
  async debit(ownerId, currencyId, amount, reason, repo = this.engine.persistence) {
    validAmount(amount);
    this.currency(currencyId);
    const current = await repo.getBalance(ownerId, currencyId);
    if (!this.engine.definition.rules.economy?.allowNegativeBalance && current < amount)
      fail('INSUFFICIENT_FUNDS', 'Insufficient currency balance', {
        currencyId,
        required: amount,
        available: current,
      });
    const value = current - amount;
    await repo.setBalance(ownerId, currencyId, value);
    await this.record('DEBIT', ownerId, currencyId, amount, reason, repo);
    await this.engine.events.emit('currency.debited', { ownerId, currencyId, amount, reason });
    return value;
  }
  async transfer(fromId, toId, currencyId, amount, reason) {
    return this.engine.transaction(async (repo) => {
      await this.debit(fromId, currencyId, amount, reason, repo);
      return this.credit(toId, currencyId, amount, reason, repo);
    });
  }
  async record(type, ownerId, currencyId, amount, reason, repo) {
    await repo.addTransaction({
      id: crypto.randomUUID(),
      type,
      playerId: ownerId,
      currencyId,
      amount,
      reason,
      timestamp: this.engine.clock.now(),
    });
  }
}
