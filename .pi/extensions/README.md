# Pi extensions

Project-local Pi extensions live here. Keep extension code small and explicit.

- `ohm/` is the `/ohm` command entrypoint. It selects the latest assistant text on the active branch, writes escaped standalone HTML under the OS temporary directory, and opens the file with the platform default handler.
- Markdown review, shared transport, response history, and scratchpad behavior are future changes.
- Do not add long-lived servers, file watchers, or timers during extension module load; start them from an explicit lifecycle event or command once designed.
