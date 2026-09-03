# pi-extension-package Specification

## Purpose

TBD - created by archiving change publish-pi-ohm-package. Update Purpose after archive.

## Requirements

### Requirement: Expose an installable Pi package

Repository SHALL expose a public package manifest at repository root. The manifest MUST have a publishable package identity and version, MUST declare the Pi package manifest, and MUST expose exactly the OHM extension entrypoint at `.pi/extensions/ohm/index.ts`.

#### Scenario: Package metadata is publishable

- **WHEN** package metadata is inspected before release
- **THEN** package is not marked private, has a non-empty name and version, identifies itself as a Pi package, and declares `@earendil-works/pi-coding-agent` as a host-provided peer dependency

#### Scenario: Pi loader discovers OHM entrypoint

- **WHEN** Pi resolves resources from the repository root package
- **THEN** Pi discovers `.pi/extensions/ohm/index.ts` as the package extension and does not require `.pi/settings.json` from this repository

#### Scenario: Git source uses repository root

- **WHEN** user installs the repository with `pi install git:github.com/MatthijsRademaker/oh-hi-mark`
- **THEN** Pi can resolve the root package manifest and discover the OHM extension without a nested-package path or manual file copy

### Requirement: Ship only the OHM runtime package surface

The published package SHALL include the OHM extension runtime sources, its complete generated application tree, package documentation, and license. It MUST exclude frontend source and dependencies, extension tests, internal project settings, internal skills, prompts, rules, Claude scaffolding, OpenSpec artifacts, and design assets.

#### Scenario: Required runtime files are packed

- **WHEN** release process inspects the npm tarball
- **THEN** tarball contains `index.ts`, `browser.ts`, `html.ts`, `response.ts`, generated `index.html`, and every generated asset required by that HTML

#### Scenario: Development-only files are not packed

- **WHEN** release process inspects the npm tarball
- **THEN** tarball contains no `web/node_modules`, frontend source, `index.test.ts`, `.pi/settings.json`, `.pi/package.json`, internal agent resources, Claude resources, or OpenSpec files

#### Scenario: Runtime has no frontend install requirement

- **WHEN** user installs package into Pi
- **THEN** package installation does not require installing Vue, Vite, Bun frontend dependencies, Shiki source packages, or DOMPurify source packages for `/ohm` to execute

### Requirement: Package generated browser build with source parity

The release process SHALL build browser output from `web/` using the repository-locked dependency set and SHALL package the resulting `.pi/extensions/ohm/generated/` tree. Release validation MUST fail when committed generated output differs from a clean production build.

#### Scenario: Source changes produce release output

- **WHEN** release build runs after a change to `web/`
- **THEN** build refreshes generated `index.html` and hashed local assets under `.pi/extensions/ohm/generated/`, and the package includes that refreshed output

#### Scenario: Generated output is stale

- **WHEN** clean release build completes and generated files have an uncommitted difference
- **THEN** release validation fails and does not publish the package

#### Scenario: File-protocol handoff remains self-contained

- **WHEN** packaged generated `index.html` is inspected
- **THEN** it contains the response payload placeholder, references assets relatively within its generated asset directory, uses the file-protocol-safe classic application entry, and does not require a CDN, module preload, external stylesheet, or runtime server

### Requirement: Installed package preserves Pi review behavior

The installed package SHALL register `/ohm` and preserve current latest-active-branch response selection, stable response identity, safe envelope handoff, private temporary output, argument-based browser launch, and local-only browser assets. `/ohm` MUST NOT build the frontend or start a server at runtime.

#### Scenario: npm-installed extension opens review

- **WHEN** user installs published package from npm, starts Pi, and runs `/ohm` after an assistant response exists
- **THEN** Pi loads the extension, writes response-specific HTML and copied local assets beneath its private temporary OHM directory, and requests the platform browser with the generated absolute path

#### Scenario: Git-installed extension opens review

- **WHEN** user installs the tagged repository from Git, starts Pi, and runs `/ohm` after an assistant response exists
- **THEN** behavior matches npm installation and generated assets resolve relative to the installed extension module

#### Scenario: Runtime has no web toolchain

- **WHEN** `/ohm` runs on a machine without Bun, Vite, or the `web/` workspace
- **THEN** command still uses packaged generated assets and does not attempt a build, dependency install, network fetch, or local server startup

#### Scenario: Existing local development remains valid

- **WHEN** maintainer runs `/ohm` from this repository's trusted project-local Pi configuration
- **THEN** current response envelope, Markdown review, scratchpad, temporary-file permissions, and browser handoff continue to work without public-package installation

### Requirement: Gate releases with source, package, and runtime checks

The release validation lane SHALL run web typecheck/tests/build, Pi extension tests and TypeScript validation or an equivalent loader check, package-content inspection, and clean installed-package smoke coverage. Browser smoke coverage MUST exercise the generated `file://` document offline.

#### Scenario: Source validation passes

- **WHEN** release validation runs against a clean checkout
- **THEN** frozen web dependencies install successfully, web typecheck and tests pass, generated output builds successfully, and Pi extension tests and type validation pass

#### Scenario: Package validation fails closed

- **WHEN** required package file is missing or forbidden development file is present in packed output
- **THEN** release validation fails before publication and reports the offending path

#### Scenario: Installed package smoke test passes

- **WHEN** packed package is installed into an isolated Pi configuration
- **THEN** Pi discovers the extension and `/ohm` can complete handoff without reading files from the source checkout or `web/`

#### Scenario: Offline browser smoke test passes

- **WHEN** generated response entry is opened directly through `file://` with network unavailable
- **THEN** local application renders the embedded response, hostile Markdown remains inert, assistant image destinations cause no requests, and console/page/request failures fail the test

#### Scenario: Narrow and keyboard review remains usable

- **WHEN** browser smoke test uses a narrow viewport and keyboard navigation
- **THEN** response and scratchpad remain available without page-level horizontal scrolling, controls have accessible names and visible focus, and copy/status actions remain operable

### Requirement: Document and version public Pi distribution

The project SHALL document npm and Git installation, required Pi compatibility, `/reload` and `/ohm` usage, local generated-asset behavior, release build commands, and package trust implications. Public release version SHALL come from the root package version and correspond to the tagged source commit.

#### Scenario: User follows installation documentation

- **WHEN** user reads repository or package README
- **THEN** README provides valid npm and Git installation commands and explains that `/ohm` runs from bundled local assets without frontend setup

#### Scenario: Release version is traceable

- **WHEN** a public package version is released
- **THEN** root package version, release metadata, and Git tag identify the same source state containing matching generated assets
