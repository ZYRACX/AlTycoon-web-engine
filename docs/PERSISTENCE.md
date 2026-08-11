# Persistence

The engine expects an injected adapter. Implement player existence, item quantities, balances, transaction records, jobs, skills, and `transaction(work)`. The adapter chooses database schema and should execute `work(repository)` inside a real database transaction. `InMemoryPersistence` documents the behavioral contract.
