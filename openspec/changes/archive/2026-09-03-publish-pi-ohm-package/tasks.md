## 1. Public Pi package boundary

- [x] 1.1 Set public root package metadata, package version, license, repository metadata, `pi-package` keyword, and host-provided Pi core peer dependency.
- [x] 1.2 Add root `pi` manifest exposing only `.pi/extensions/ohm/index.ts` as the public extension entrypoint.
- [x] 1.3 Add explicit package file allowlist covering OHM runtime sources, generated browser assets, README, and license while excluding repository-only resources and tests.
- [x] 1.4 Tighten the project-local `.pi` extension manifest to an explicit OHM entry without breaking trusted checkout development.

## 2. Generated application release input

- [x] 2.1 Add release scripts for frozen web dependency installation, production build, Pi extension validation, generated-output parity, and package validation.
- [x] 2.2 Add generated-output checks for the response placeholder, relative local assets, file-protocol-safe classic entry, and absence of runtime CDN/server requirements.
- [x] 2.3 Add a dedicated TypeScript configuration and development-only type dependencies for `.pi/extensions/ohm/`, or implement an equivalent authoritative Pi loader validation lane.
- [x] 2.4 Regenerate `.pi/extensions/ohm/generated/` from current `web/` source and verify the committed output is clean and complete.

## 3. Package and Pi installation verification

- [x] 3.1 Add packed-artifact inspection that asserts required runtime files/assets exist and forbidden frontend, test, internal configuration, Claude, and OpenSpec files are absent.
- [x] 3.2 Add an isolated local-package install smoke test that resolves the root manifest, loads the extension, and runs `/ohm` without using the source checkout's `web/` workspace.
- [x] 3.3 Add a Git-source install smoke path against a clean repository checkout and verify generated assets resolve beside the installed extension module.
- [x] 3.4 Extend Pi adapter coverage for packaged-path lookup, browser-launch error reporting, and platform launcher argument handling without changing response behavior.

## 4. Offline browser verification

- [x] 4.1 Add browser smoke tooling and fixtures for opening a response-specific generated entry directly through `file://`.
- [x] 4.2 Verify offline Markdown rendering, hostile HTML/link handling, inert image behavior, local asset loading, and zero response-triggered network requests.
- [x] 4.3 Verify narrow viewport layout, independent response/scratchpad usability, keyboard focus, accessible names, copy status, and reduced-motion behavior.

## 5. Documentation and release rehearsal

- [x] 5.1 Document npm and Git installation, Pi compatibility, `/reload` and `/ohm` usage, trust implications, and absence of frontend runtime setup.
- [x] 5.2 Document release sequence: build, generated-diff check, source tests, package inspection, isolated install, browser smoke, version/tag, and publication.
- [x] 5.3 Add CI validation for source checks, generated parity, package contents, and supported Pi runtime checks; keep publication credentials and registry selection outside repository runtime code.
- [x] 5.4 Perform first release rehearsal from a clean checkout and record final package name/scope, bundle-size decision, and npm/Git installation results.
