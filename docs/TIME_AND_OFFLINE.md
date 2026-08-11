# Time and offline progression

Use `clock.now()`—never client timestamps—for job completion. `SystemClock` is production time and `MockClock` makes tests deterministic. `calculateOfflineProduction` calculates elapsed work on demand, avoiding a background timer for every player. Capacity caps the returned result.
