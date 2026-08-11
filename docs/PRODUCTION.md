# Production

Recipes are pure data: inputs, outputs, and duration. Starting a job atomically removes inputs and saves a running job. Completing a job checks the injected server clock, atomically grants outputs, and changes status. Do not accept completion time or output quantity from a client.
