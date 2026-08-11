# Plugin system

Plugins are lightweight systems. They may implement `initialize(engine)`, `start(engine)`, and `shutdown(engine)`. Use `engine.use(new MySystem())`. Register namespaced commands such as `logistics.route` to avoid collisions.
