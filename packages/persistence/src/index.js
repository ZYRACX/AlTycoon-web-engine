/** In-memory adapter; applications can implement the same repository methods with any database. */
export class InMemoryPersistence {
  constructor() {
    this.players = new Set();
    this.inventory = new Map();
    this.balances = new Map();
    this.jobs = new Map();
    this.skills = new Map();
    this.transactions = [];
  }
  async initialize() {}
  async transaction(work) {
    const snapshot = structuredClone({
      players: this.players,
      inventory: this.inventory,
      balances: this.balances,
      jobs: this.jobs,
      skills: this.skills,
      transactions: this.transactions,
    });
    try {
      return await work(this);
    } catch (error) {
      Object.assign(this, snapshot);
      throw error;
    }
  }
  async createPlayer(id) {
    this.players.add(id);
    return { id, type: 'player', data: {} };
  }
  async hasPlayer(id) {
    return this.players.has(id);
  }
  key(ownerId, id) {
    return `${ownerId}:${id}`;
  }
  async getItemQuantity(ownerId, itemId) {
    return this.inventory.get(this.key(ownerId, itemId)) ?? 0;
  }
  async setItemQuantity(ownerId, itemId, quantity) {
    this.inventory.set(this.key(ownerId, itemId), quantity);
  }
  async getInventory(ownerId) {
    return [...this.inventory.entries()]
      .filter(([key]) => key.startsWith(`${ownerId}:`))
      .map(([key, quantity]) => ({ itemId: key.slice(ownerId.length + 1), quantity }));
  }
  async getBalance(ownerId, currencyId) {
    return this.balances.get(this.key(ownerId, currencyId)) ?? 0;
  }
  async setBalance(ownerId, currencyId, value) {
    this.balances.set(this.key(ownerId, currencyId), value);
  }
  async addTransaction(record) {
    this.transactions.push(record);
  }
  async createJob(job) {
    this.jobs.set(job.id, job);
    return job;
  }
  async getJob(id) {
    return this.jobs.get(id);
  }
  async updateJob(id, update) {
    const job = { ...this.jobs.get(id), ...update };
    this.jobs.set(id, job);
    return job;
  }
  async getJobs(ownerId) {
    return [...this.jobs.values()].filter((job) => job.ownerId === ownerId);
  }
  async getSkills(ownerId) {
    return [...(this.skills.get(ownerId) ?? new Set())];
  }
  async unlockSkill(ownerId, skillId) {
    const skills = this.skills.get(ownerId) ?? new Set();
    skills.add(skillId);
    this.skills.set(ownerId, skills);
  }
}
