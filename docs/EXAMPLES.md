# Examples

Factory Demo defines generic wood, plank, and a saw recipe in application content. It demonstrates that a game is composed through data and systems, not modifications to engine source.

For a future application, create its own `GameDefinition` with its items, recipes, buildings, skills, and rules, then inject database repositories. Keep application-specific identifiers and rules outside these packages.
