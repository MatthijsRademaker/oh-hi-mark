## Context

OHM currently has two relevant boundaries:

- `web/` is the Vue/Vite source workspace. Its production build writes a classic file-protocol-safe application plus local assets to `.pi/extensions/ohm/generated/`.
- `.pi/extensions/ohm/` is the Pi runtime. `index.ts` registers `/ohm`; `html.ts` resolves `generated/` beside the extension module, injects the response envelope, copies trusted assets to a private temporary directory, and opens the resulting `file://` document.

The repository is usable as a project-local Pi configuration because `.pi/settings.json` loads `.pi/package.json`. It is not yet a distributable package: the root package is private and has no `pi` manifest, while the nested package contains project-only skills, prompts, rules, tests, and settings.

Pi packages are loaded from the package root's `package.json`. Git installation clones the repository root and runs its package installation; npm installation extracts the published package. The package must therefore expose the Pi extension from the root manifest and include every runtime file needed by the `import.meta.url`-relative asset lookup.

Assistant response content remains untrusted. This change must preserve safe envelope serialization, sanitized Markdown rendering, inert image handling, private temporary output, argument-based browser launch, and offline local asset loading.

## Goals / Non-Goals

**Goals:**

- Make the repository installable as one Pi package from both npm and Git.
- Establish an explicit public package boundary containing only the `/ohm` runtime and its generated browser application.
- Keep `web/` as the source of truth and ensure packaged generated output matches it at release time.
- Validate the exact packed artifact, extension loading, `file://` browser behavior, local-only runtime, and narrow-layout/accessibility basics.
- Keep frontend dependencies build-time only and use Pi-provided core APIs at runtime.
- Preserve project-local development and current `/ohm` behavior.

**Non-Goals:**

- Claude Code plugin packaging or adapter implementation.
- Shared transport, local HTTP/WebSocket servers, response history, or live refresh.
- Runtime frontend compilation, dependency installation, or network access from `/ohm`.
- New response-envelope fields or changes to response selection.
- Frontend visual redesign or new review interactions.
- Publishing internal project skills, prompts, rules, OpenSpec artifacts, or tests as part of the public package.

## Decisions

### 1. Use repository root as public Pi package boundary

Add the public package manifest to the repository root and expose the existing runtime at `.pi/extensions/ohm/index.ts` through its `pi.extensions` field. Keep the current root development scripts and `web/` workspace, but use an explicit npm `files` allowlist so those development files are not published.

This supports both `pi install npm:<package>` and `pi install git:github.com/MatthijsRademaker/oh-hi-mark` without requiring Pi to understand a nested package directory.

Alternative rejected: publish `.pi/` as a standalone npm package. That can support npm installation, but Git installation of this repository still sees the private root package and the nested package would ship unrelated project configuration. A separate package repository would avoid the hidden path but adds a second source boundary before the first public release.

### 2. Expose one explicit extension entry

The public manifest lists only `.pi/extensions/ohm/index.ts`. The extension's neighboring `browser.ts`, `html.ts`, `response.ts`, and `generated/` files are package files but are not independent Pi resources. The existing project-local manifest should also use an explicit OHM entry where practical.

This prevents tests or future TypeScript files under `.pi/extensions/ohm/` from becoming extension entrypoints and makes package inspection deterministic.

### 3. Publish a narrow runtime allowlist

The package allowlist includes:

- public package metadata, README, and license;
- `.pi/extensions/ohm/index.ts`;
- `.pi/extensions/ohm/browser.ts`;
- `.pi/extensions/ohm/html.ts`;
- `.pi/extensions/ohm/response.ts`;
- the complete `.pi/extensions/ohm/generated/` tree.

It excludes `index.test.ts`, `web/`, frontend dependencies, `.pi/settings.json`, `.pi/package.json`, internal skills/prompts/rules, Claude files, OpenSpec artifacts, and design assets. Pi's `pi` manifest does not advertise skills, prompts, or themes for this public package.

Alternative rejected: publish the whole repository or the whole `.pi/` tree. That increases package size, leaks development instructions, and creates accidental resource loading.

### 4. Treat generated browser output as committed release input

`web/` remains source of truth. Release preparation runs the pinned Bun install and production build, which refreshes `.pi/extensions/ohm/generated/`. Generated files remain committed because installed Pi users must not need Bun, Vite, frontend dependencies, or a server.

CI runs the build and then fails if generated output has an uncommitted diff. Packaging checks inspect the actual npm tarball, not only the working tree. The generated `index.html` must retain the response placeholder, relative local asset references, deferred classic script behavior, and no external runtime resources.

Alternative rejected: `postinstall`/runtime builds, CDN dependencies, or a local web server. These add install-time tooling requirements, lifecycle risk, network exposure, port management, or file-protocol behavior changes.

### 5. Keep runtime dependency model Pi-native

The public package declares `@earendil-works/pi-coding-agent` as a peer dependency according to Pi package conventions. The extension uses Pi APIs and Node built-ins only. Vue, Vite, Shiki, DOMPurify, and other frontend dependencies remain in `web/package.json` for build and test; they are not runtime package dependencies.

The package remains an ES module and continues using TypeScript extension sources, which Pi loads through its extension loader. A dedicated extension TypeScript check uses the Pi core and Node types during development without bundling them into the published package.

Alternative rejected: bundling Pi core or shipping the entire frontend dependency tree. Pi supplies core APIs, and the browser bundle already contains its frontend runtime.

### 6. Add layered release validation

Validation has four layers:

1. Web source: frozen dependency install, typecheck, unit tests, and production build.
2. Pi source: extension typecheck or equivalent loader validation plus existing response and handoff tests.
3. Package artifact: npm pack inspection asserting required runtime files/assets and excluding development-only files.
4. Installed runtime: temporary Pi installation and browser smoke coverage against the generated `file://` document, including offline loading, hostile Markdown, no image requests, keyboard actions, and a narrow viewport.

The release lane also reports generated bundle size. The current approximately 2.2 MB JavaScript bundle and approximately 5.9 MB generated asset tree are accepted for the first package unless a later change establishes a smaller budget.

### 7. Version root package, document install, preserve local mode

The root package version is the public release version. The README documents npm and Git installation, `/reload`, `/ohm`, required Pi version compatibility, build commands, and the fact that the browser app is bundled locally.

`.pi/settings.json` continues to support this repository's local development package. Public installation does not depend on project trust settings from this repository. No persisted user schema or runtime migration is required; existing response-specific temporary files remain valid and are cleaned by normal OS temporary-file policy.

## Risks / Trade-offs

- **[Generated assets drift from `web/`]** → Run build in CI and fail on a generated-directory diff; inspect the exact packed tarball.
- **[Explicit package paths omit a required imported module or asset]** → Add package-content assertions and run `/ohm` from a temporary installed package, not only from the checkout.
- **[Hidden `.pi` paths behave differently in npm or Pi package extraction]** → Use an npm pack smoke test and a clean npm/Git install test before publishing.
- **[`file://` behavior differs across browsers or operating systems]** → Keep relative assets/classic bundle, monitor browser console and requests, and test platform browser launchers separately.
- **[Pi API or loader compatibility changes]** → Keep the Pi core as a peer dependency, document minimum compatibility, and test against the supported Pi version in CI.
- **[Large Shiki bundle slows package and first render]** → Report size during release; retain current explicit grammar set for v0.1 and optimize in a separate scoped change if needed.
- **[Public package accidentally includes internal instructions or tests]** → Use an allowlist rather than broad directory publication and assert forbidden paths are absent from the tarball.
- **[Package install has full system permissions]** → Document trust implications and keep extension behavior limited to the existing local temporary-file and browser handoff boundary.

## Migration Plan

1. Add public root package metadata, Pi manifest, license, package file allowlist, and release scripts/checks.
2. Tighten project-local extension manifest paths without changing `/ohm` behavior.
3. Regenerate and inspect committed browser assets.
4. Run source, package, install, and browser validation in a clean environment.
5. Publish the first version to the chosen npm name and tag the corresponding Git commit.
6. Verify both npm and Git installation commands in a fresh Pi configuration.

Rollback is a source release rollback: revert the package metadata/release change or stop publishing new versions. Existing published versions remain immutable; existing local Pi use continues because the extension runtime and generated assets are unchanged.

## Open Questions

- What final npm name/scope should be used? Default candidate is the existing root name `oh-hi-mark`; a scoped `pi-ohm` name may be preferable if available.
- Should release publication be manual or automated from Git tags? The package contract is independent of that choice.
- Is the current approximately 5.9 MB generated asset size acceptable for the first public release? This design accepts it provisionally.
