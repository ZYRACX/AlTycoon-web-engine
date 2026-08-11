# Testing

Use `MockClock` and `SeededRandomSource` for deterministic tests. The suite exercises validation, stock limits, balances, transfers, jobs, offline calculation, prerequisites, modifiers, and rollback. Production persistence adapters should add concurrency tests using their database's locking/transaction facilities.
