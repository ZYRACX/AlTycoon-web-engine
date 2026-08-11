import { fail } from './errors.js';
const unique = (values, name) => {
  const ids = values.map((x) => x.id);
  if (new Set(ids).size !== ids.length)
    fail('INVALID_DEFINITION', `Duplicate ${name} id`, { name });
};
export class GameDefinition {
  constructor(data = {}) {
    this.currencies = data.currencies ?? [];
    this.items = data.items ?? [];
    this.recipes = data.recipes ?? [];
    this.buildings = data.buildings ?? [];
    this.skills = data.skills ?? [];
    this.modifiers = data.modifiers ?? [];
    this.rules = data.rules ?? {};
  }
  validate() {
    for (const [name, values] of Object.entries({
      currencies: this.currencies,
      items: this.items,
      recipes: this.recipes,
      skills: this.skills,
    })) {
      if (!Array.isArray(values)) fail('INVALID_DEFINITION', `${name} must be an array`);
      if (values.some((x) => !x?.id)) fail('INVALID_DEFINITION', `${name} entries require an id`);
      unique(values, name);
    }
    for (const recipe of this.recipes) {
      if (!Array.isArray(recipe.inputs) || !Array.isArray(recipe.outputs) || recipe.duration < 0)
        fail('INVALID_RECIPE', 'Recipe requires inputs, outputs, and a non-negative duration', {
          recipeId: recipe.id,
        });
    }
    return this;
  }
  getItem(id) {
    return this.items.find((x) => x.id === id);
  }
  getCurrency(id) {
    return this.currencies.find((x) => x.id === id);
  }
  getRecipe(id) {
    return this.recipes.find((x) => x.id === id);
  }
  getSkill(id) {
    return this.skills.find((x) => x.id === id);
  }
}
