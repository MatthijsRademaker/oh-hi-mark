# Extension development

- `.pi/` is canonical for project-local Pi resources.
- Keep `.claude` shared-resource links pointed at `.pi`; do not create a second implementation there.
- `/ohm` currently registers a notification-only stub. Do not add response capture or browser launch without an approved OpenSpec change.
- Pi extensions run with full user permissions. Treat subprocesses, local servers, and file access as security-sensitive.
- Do not start long-lived resources during module load. Define lifecycle and shutdown behavior before adding them.
- Use Pi's typed extension APIs and preserve error visibility.
