# Architecture

Dependency direction is application → definition → systems → core. `GameEngine` coordinates injected systems, commands, queries, event bus, clock, and persistence. Systems never know a game theme. Persistence is an adapter supplied by the application.
