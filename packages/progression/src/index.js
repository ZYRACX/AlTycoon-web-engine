import { GameSystem, fail } from '@soumya/game-engine-core';
export class SkillSystem extends GameSystem {
  initialize(engine) {
    this.engine = engine;
    engine.skills = this;
    engine.progression = this;
    engine.registerCommand('skill.unlock', ({ playerId, skillId }) =>
      this.unlock(playerId, skillId),
    );
  }
  async isUnlocked(playerId, skillId) {
    return (await this.engine.persistence.getSkills(playerId)).includes(skillId);
  }
  async canUnlock(playerId, skillId, points = Infinity) {
    const skill = this.engine.definition.getSkill(skillId);
    if (!skill) return false;
    if (await this.isUnlocked(playerId, skillId)) return false;
    const unlocked = await this.engine.persistence.getSkills(playerId);
    return skill.cost <= points && (skill.prerequisites ?? []).every((id) => unlocked.includes(id));
  }
  async unlock(playerId, skillId, points = Infinity) {
    if (!(await this.canUnlock(playerId, skillId, points)))
      fail('SKILL_LOCKED', 'Skill cannot be unlocked', { skillId });
    await this.engine.persistence.unlockSkill(playerId, skillId);
    await this.engine.events.emit('skill.unlocked', { playerId, skillId });
    return this.engine.definition.getSkill(skillId);
  }
  async getAvailable(playerId, points = Infinity) {
    const skills = this.engine.definition.skills;
    return (
      await Promise.all(
        skills.map(async (skill) =>
          (await this.canUnlock(playerId, skill.id, points)) ? skill : null,
        ),
      )
    ).filter(Boolean);
  }
}
