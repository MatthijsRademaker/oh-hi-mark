# Pi extensions

Project-local Pi extensions live here. Keep extension code small and explicit.

- `ohm/` is the current `/ohm` command entrypoint.
- Browser launch, response extraction, transport, and scratchpad behavior are future changes.
- Do not add long-lived servers, file watchers, or timers during extension module load; start them from an explicit lifecycle event or command once designed.
