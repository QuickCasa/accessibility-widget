# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## 1.0.0 - 2026-10-02

First open source release.

### Features

- Skip link that moves keyboard focus to the main content, and removes itself
  when the page has none.
- Colour contrast, text size, text spacing, link underlining, focus
  highlighting and reduced motion controls.
- Preferences saved per origin in localStorage, with the operating system's
  reduced motion setting honoured when nothing is saved.
- Configuration through data attributes, each validated with a console warning
  and a safe default for invalid values.
- A small `window.QuickCasaAccessibility` API to open, close and reset the panel.
- Constructed stylesheets for both the page rules and the widget's own shadow
  roots, so it works under a strict Content-Security-Policy, with a `<style>`
  element fallback for older browsers.

### Tooling

- Unit and integration tests in jsdom.
- A size budget enforced in CI.
- A demo site with stress test, hostile configuration and strict CSP pages.
