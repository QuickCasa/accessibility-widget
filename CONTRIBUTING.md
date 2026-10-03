# Contributing

Thanks for wanting to help. Bug reports, browser compatibility findings and
pull requests are all welcome.

## What this project will and will not accept

This widget keeps a narrow scope on purpose. Before you start on a feature,
check it against these rules:

- **No automated remediation.** No generated alt text, no rewriting the host
  site's markup, no "fixing" ARIA. Those approaches break things and encourage
  false compliance claims.
- **No network requests.** No analytics, no remote configuration, no fonts or
  assets fetched from anywhere. The script must work on a page with no network
  access beyond itself.
- **No runtime dependencies.** Everything ships in the one file.
- **No CSS filters on the document.** They break fixed and sticky positioning on
  the host site. A test enforces this.
- **Stay inside the size budget.** CI fails above the limits in
  `scripts/check-size.mjs`. Raising them takes a good reason in the pull request.
- **Never claim compliance.** Copy, docs and labels describe what a control does,
  never what legal or WCAG status it confers.

If you are unsure whether an idea fits, open an issue first and ask. It saves
everyone a wasted pull request.

## Getting set up

You need Node.js 20.19 or later.

```bash
npm install
npm run check
```

`npm run check` runs everything CI runs: the formatting check, the typecheck,
the tests, the build and the size budget. Please make sure it passes before you
open a pull request.

`npm run preview` builds the demo site and serves it on
`http://localhost:8788`. Test any visual change on `stress-test.html`, and with
the browser's own high contrast and reduced motion settings switched on.

## Code style

- TypeScript in strict mode. Avoid `any` and `unknown`; use specific types.
- Prettier formats everything. Run `npm run format` before committing.
- Comments explain **why**, not what. Public functions get a JSDoc block.
- Use full words for names, such as `preferences` rather than `prefs`.
- Every regular expression carries the `u` flag.
- User-facing text uses Canadian English spelling, such as "colour".
- Never write into the host page with `innerHTML`. Build nodes, so the widget
  keeps working under Trusted Types.

## Tests

Tests live in `test/` and run in jsdom. Add a test for any behaviour you add or
fix. jsdom does no layout, so anything that depends on real rendering, such as
zoom or focus ring visibility, also needs a manual check in a real browser. Say
which browsers you checked in the pull request.

## Releasing

Maintainers only.

1. Update the version in `package.json` and add an entry to `CHANGELOG.md`.
2. Commit, then tag the commit, for example `git tag v1.1.0`.
3. Push the commit and the tag. The release workflow builds, tests, creates the
   GitHub release with the bundle attached and publishes to npm when an npm
   token is configured. The Pages workflow redeploys the demo site.

**Before a new major version:** the demo site serves the bundle under its major
version, such as `v1/`, and only holds what the current build produces. The
release that moves to `v2/` must also carry the final v1 bundle forward, for
example by downloading it from the last v1 release in the Pages workflow, or
every site embedding the `v1/` URL starts getting a 404.

## Reporting security issues

Please do not open a public issue. See [SECURITY.md](SECURITY.md).

## Code of conduct

Everyone taking part is expected to follow the
[code of conduct](CODE_OF_CONDUCT.md).
