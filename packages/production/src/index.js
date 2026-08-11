import { GameSystem, fail } from '@soumya/game-engine-core';
export const calculateOfflineProduction = ({
  lastProcessedAt,
  currentTime,
  productionRate,
  capacity = Infinity,
}) => Math.min(capacity, Math.max(0, currentTime - lastProcessedAt) * productionRate);
export class ProductionSystem extends GameSystem {
  initialize(engine) {
    this.engine = engine;
    engine.production = this;
    engine.registerCommand('production.start', (x, tx) =>
      this.start(x.ownerId, x.recipeId, x.quantity ?? 1, tx),
    );
    engine.registerCommand('production.complete', (x, tx) => this.complete(x.jobId, tx));
  }
  recipe(recipeId) {
    const recipe = this.engine.definition.getRecipe(recipeId);
    if (!recipe) fail('RECIPE_NOT_FOUND', 'Recipe does not exist', { recipeId });
    return recipe;
  }
  async canStart(ownerId, recipeId, quantity = 1, repo = this.engine.persistence) {
    if (!Number.isInteger(quantity) || quantity <= 0) return false;
    const recipe = this.recipe(recipeId);
    return (
      await Promise.all(
        recipe.inputs.map(
          async (input) =>
            (await repo.getItemQuantity(ownerId, input.itemId)) >= input.quantity * quantity,
        ),
      )
    ).every(Boolean);
  }
  async start(ownerId, recipeId, quantity = 1, repo = this.engine.persistence) {
    if (!(await this.canStart(ownerId, recipeId, quantity, repo)))
      fail('MISSING_INPUTS', 'Recipe inputs are unavailable', { recipeId, quantity });
    const recipe = this.recipe(recipeId);
    return this.engine.transaction(async (tx) => {
      for (const input of recipe.inputs)
        await this.engine.inventory.remove(ownerId, input.itemId, input.quantity * quantity, tx);
      const startedAt = this.engine.clock.now();
      const job = {
        id: crypto.randomUUID(),
        ownerId,
        recipeId,
        quantity,
        startedAt,
        finishAt: startedAt + recipe.duration * quantity,
        status: 'RUNNING',
        metadata: {},
      };
      await tx.createJob(job);
      await this.engine.events.emit('production.started', { playerId: ownerId, jobId: job.id });
      return job;
    });
  }
  getJob(jobId) {
    return this.engine.persistence.getJob(jobId);
  }
  getActiveJobs(ownerId) {
    return this.engine.persistence
      .getJobs(ownerId)
      .then((jobs) => jobs.filter((job) => job.status === 'RUNNING'));
  }
  async isComplete(jobId) {
    const job = await this.getJob(jobId);
    return Boolean(job && job.status === 'RUNNING' && this.engine.clock.now() >= job.finishAt);
  }
  async complete(jobId, repo = this.engine.persistence) {
    const job = await repo.getJob(jobId);
    if (!job) fail('JOB_NOT_FOUND', 'Production job does not exist', { jobId });
    if (!(await this.isComplete(jobId)))
      fail('JOB_NOT_COMPLETE', 'Production job is not complete', { jobId });
    const recipe = this.recipe(job.recipeId);
    return this.engine.transaction(async (tx) => {
      for (const output of recipe.outputs)
        await this.engine.inventory.add(
          job.ownerId,
          output.itemId,
          output.quantity * job.quantity,
          tx,
        );
      const completed = await tx.updateJob(jobId, {
        status: 'COMPLETED',
        completedAt: this.engine.clock.now(),
      });
      await this.engine.events.emit('production.completed', { playerId: job.ownerId, jobId });
      return completed;
    });
  }
  async cancel(jobId) {
    const job = await this.getJob(jobId);
    if (!job || job.status !== 'RUNNING')
      fail('JOB_NOT_CANCELLABLE', 'Production job is not running', { jobId });
    return this.engine.persistence.updateJob(jobId, { status: 'CANCELLED' });
  }
}
