# API

`GameEngine.use(system)`, `initialize()`, `start()`, `stop()`, `execute(name,input)`, `query(name,input)`, and `transaction(work)` are the integration surface. Inventory offers `add/remove/has/get/getAll`; economy offers `getBalance/credit/debit/transfer`; production offers `canStart/start/getJob/getActiveJobs/isComplete/complete/cancel`; skills offer `canUnlock/unlock/isUnlocked/getAvailable`.
