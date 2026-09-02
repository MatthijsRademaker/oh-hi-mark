# Web review suite guardrails

- Render assistant output as untrusted Markdown; sanitize before inserting HTML.
- Keep transport local by default and do not add telemetry without explicit approval.
- Keep response and scratchpad state separate, with response identity as their join key.
- Preserve keyboard access, visible focus, narrow layouts, and reduced-motion behavior.
- Do not add frontend dependencies until a Vue workspace and implementation proposal exist.
