# OHM web review suite

Future Vue 3/Vite browser workspace for rendering the latest harness response and editing a review scratchpad.

This directory is intentionally documentation-only in the scaffold. Planned responsibilities:

- render a response envelope as safe Markdown;
- keep response and scratchpad scrolling independent;
- persist notes by response identity;
- expose accessible keyboard and responsive interactions.

Candidate stack: Bun, Vue 3, `markdown-it`, DOMPurify, and Shiki. Confirm choices in an OpenSpec implementation change before creating the app or installing dependencies.
