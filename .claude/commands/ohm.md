---
description: Open latest assistant response in the OHM browser review workspace
---

# OHM

This is the project-local Claude Code entrypoint for the future OHM review workspace.

Current state: scaffold only. Do not claim that a browser opened, that a response was captured, or that a scratchpad was persisted. The browser bridge and response transport must be implemented in a separate OpenSpec change.

When implementation exists, this command should hand the current session's latest assistant response to the local OHM workspace and report the resulting local URL.
