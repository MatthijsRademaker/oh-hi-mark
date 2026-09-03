# OHM release checklist

Root package is public Pi package `oh-hi-mark`. Public version comes from root `package.json`; matching Git tag uses `v<version>`.

## Preconditions

- Pi 0.84.4+ available on `PATH` or supplied through `PI_CLI`.
- Node.js 22.19+.
- Bun 1.3.2+.
- Chrome or Chromium available for browser smoke; set `OHM_BROWSER_BIN` otherwise.
- Clean checkout before release. Do not publish from a dirty tree.

## Validation sequence

Run from repository root:

```bash
bun install --frozen-lockfile
bun run release:build
bun run web:typecheck
bun run web:test
bun run pi:typecheck
bun run pi:test
bun run package:inspect
bun run package:smoke
bun run git:smoke
bun run browser:smoke
npm pack --dry-run
```

`release:build` installs `web/` from `web/bun.lock`, builds production output into `.pi/extensions/ohm/generated/`, checks the response marker and local file-protocol assets, and fails on generated-tree changes. `package:inspect` checks actual tarball contents. `package:smoke` installs that tarball into an isolated Pi project and runs `/ohm`. `git:smoke` does the same from a clean Git checkout. `browser:smoke` opens a response-specific generated entry directly through `file://` with network URLs blocked.

Full combined lane:

```bash
bun run release:validate
```

## Version, tag, publish

1. Choose version in root `package.json`.
2. Run validation sequence from a clean checkout.
3. Inspect `npm pack --dry-run` output and bundle-size report.
4. Commit package metadata and matching generated assets.
5. Create tag matching root version:

   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   git push origin main v0.1.0
   ```

6. Publish package from tagged commit:

   ```bash
   npm publish --access public
   ```

7. Verify fresh installs:

   ```bash
   pi install npm:oh-hi-mark@0.1.0
   pi install git:github.com/MatthijsRademaker/oh-hi-mark@v0.1.0
   ```

Registry choice, npm credentials, Git credentials, and publication tokens stay outside repository runtime code and CI logs.

## First release rehearsal

Recorded 2026-09-03:

- Final package identity: unscoped `oh-hi-mark@0.1.0`.
- Generated application tree: 6,071,761 bytes (about 5.9 MiB). Decision: retain current Shiki bundle for v0.1.0; optimize in separate change.
- Packed npm artifact: about 4,364,857 bytes; required runtime files present and repository-only files absent.
- npm install result: passed isolated packed-tarball install, Pi manifest discovery, `/ohm` RPC command, private response file, and copied local assets.
- Git install result: passed clean checkout smoke from a local working-tree release snapshot. Repeat against tagged `v0.1.0` after commit and push.
- Browser result: passed direct `file://` smoke with offline Markdown, hostile content, inert images, local assets, narrow viewport, keyboard focus, copy status, and reduced motion.
- Publication result: not performed during rehearsal; no registry credentials or release tag created by validation.
