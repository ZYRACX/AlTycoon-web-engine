# Extending

Extend `GameSystem`, attach it with `engine.use`, and register command/query handlers in `initialize`. Keep game-specific rules in the definition or your own system. A command should validate caller input, calculate using engine state, persist through the supplied transaction repository, then emit an event.
