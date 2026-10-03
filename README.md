# Accessibility Widget

[![CI](https://github.com/QuickCasa/accessibility-widget/actions/workflows/ci.yml/badge.svg)](https://github.com/QuickCasa/accessibility-widget/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A free, open source accessibility toolbar for any website. Add one script tag and
visitors can adjust contrast, text size, spacing, focus highlighting and motion,
and get a skip link that moves keyboard focus to your main content. You
configure it with data attributes on the same tag, and it needs no account or API
key.

The script is about 18 KB raw and 6 KB gzipped, with a size budget enforced in
CI. It makes no network requests.

**[Live demo](https://quickcasa.github.io/accessibility-widget/)**

## What it does and doesn't do

The widget gives visitors control over how your site looks and moves for them,
and adds a working skip link. It doesn't generate alt text, rewrite your markup
or try to fix your site automatically.

**This doesn't make a site WCAG or ADA compliant or reduce legal exposure, and
no script can.** In 2025 the US Federal Trade Commission ordered one overlay
vendor to pay $1 million for claiming its widget made websites WCAG compliant.
Accessibility comes from how a site is built and tested. If you use this widget,
please describe it the same way this README does.

## Quick start

Download `accessibility.js` from the
[latest release](https://github.com/QuickCasa/accessibility-widget/releases/latest),
host it with the rest of your site, and add it to `<head>`:

```html
<script src="/accessibility.js" defer></script>
```

Use `defer` in `<head>`. Saved preferences are applied the moment the script
runs, before the widget is drawn, so a returning visitor never sees the
unmodified page first.

### Trying it without hosting anything

The demo site serves the latest 1.x release:

```html
<script
  src="https://quickcasa.github.io/accessibility-widget/v1/accessibility.js"
  defer></script>
```

That is fine for evaluating the widget. For production, self-host a release so
you control exactly which version your visitors get and you are not depending on
GitHub Pages as a CDN.

## Configuration

Everything is optional.

```html
<script
  src="/accessibility.js"
  data-qc-accessibility
  data-main-content-selector="#content"
  data-position="bottom-left"
  data-accent="#0F62FE"
  data-features="skip-link,contrast,text-size,reduce-motion"
  data-button-label="Accessibility"
  data-storage-key="acme_a11y"
  defer></script>
```

| Attribute                    | Default                 | Notes                                                                                                                                      |
| ---------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-qc-accessibility`      | none                    | A marker with no value. Helps the script find its own tag if a loader hides `document.currentScript`. Harmless to always include.          |
| `data-main-content-selector` | automatic               | Any CSS selector. Falls back to `main`, `[role="main"]`, `.main-content`, `#main`, `#main-content`, `#content`, in that order.             |
| `data-position`              | `bottom-right`          | Also `bottom-left`, `top-right`, `top-left`.                                                                                               |
| `data-accent`                | `#6A24FF`               | Hex only. Anything else is rejected with a console warning.                                                                                |
| `data-features`              | all                     | Comma-separated allowlist. Keys: `skip-link`, `contrast`, `text-size`, `text-spacing`, `link-underline`, `focus-outline`, `reduce-motion`. |
| `data-button-label`          | `Accessibility options` | The accessible name of the trigger button.                                                                                                 |
| `data-storage-key`           | `qc_a11y_v1`            | The localStorage key. Change it to keep preferences separate for several sites on one origin.                                              |

Invalid values never break the page. Each one is ignored with a console warning
and the default is used instead. A duplicate script tag is ignored rather than
drawing a second widget, which matters because a tag manager plus a hardcoded tag
is a common accident.

## Features

| Feature         | What it does                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Skip to main    | The first tab stop on the page. Moves **keyboard focus** to the main content, so the next Tab starts there. |
| Colour contrast | Light text on dark or dark text on light, without breaking fixed or sticky headers.                         |
| Text size       | 100, 115, 130 or 150 percent. Works like browser zoom, so text set in pixels scales too.                    |
| Text spacing    | The WCAG 1.4.12 values: line height 1.5, paragraph spacing 2em, letter spacing 0.12em, word spacing 0.16em. |
| Underline links | Underlines `a[href]` only, skipping image-only and icon-only links.                                         |
| Highlight focus | Two-tone focus ring, white inside a black outer ring, so it stands out on light and dark backgrounds.       |
| Reduce motion   | Stops animations and transitions, and pauses autoplaying video and audio.                                   |
| Reset all       | Clears storage and puts the page back the way it was.                                                       |

Preferences persist per origin in localStorage and never leave the visitor's
device. With nothing stored, motion reduction starts **on** when the operating
system already asks for it. That seeded value is not written to storage, so a
later change to the operating system setting is still respected.

## JavaScript API

Once the widget is drawn, a small API is available on `window`:

```js
window.QuickCasaAccessibility.open()
window.QuickCasaAccessibility.close()
window.QuickCasaAccessibility.reset()
window.QuickCasaAccessibility.getPreferences()
```

Useful for an "Accessibility options" link in your own footer.

## Design decisions worth knowing

**No CSS filters, anywhere.** `filter` on the root element makes it a containing
block for fixed descendants, which silently breaks every sticky header on the
host site. That rules out the cheap `invert()` dark mode and greyscale. Contrast
is done with colour declarations only, and a test fails the build if a filter
ever appears.

**The accent colour is decorative only.** It is used for borders and focus rings,
never as a background behind text. A site can pass any hex value, and if the
accent were load-bearing for contrast then a pale brand colour would make the
accessibility widget itself unreadable.

**Specificity is deliberate.** The universal selector's exclusion list is wrapped
in `:where()` so it contributes zero specificity. Written as chained `:not(#id)`
instead, the two id selectors hand `*` id-level specificity and later rules lose
to it. This happened once already: high-contrast links came out white instead of
yellow.

**The widget counter-zooms itself.** Page scaling is applied to `body`. Without a
reciprocal `zoom` on the widget's own hosts, the panel's fixed positioning scales
too, and at 150 percent it walks off the edge of the viewport.

**Constructed stylesheets first.** Both the rules applied to your page and the
widget's own styles inside its shadow roots use `adoptedStyleSheets`, which is
not an inline style. That means the widget works under a strict
Content-Security-Policy without `style-src 'unsafe-inline'`. A `<style>` element
is the fallback for older browsers only. `demo/strict-csp.html` tests this.

**Icons are built node by node**, not via `innerHTML`, so the widget still
renders on sites enforcing Trusted Types.

**The shadow roots are open**, so automated auditing tools and your own tests can
inspect the widget.

## Known limits

- **Content inside the host site's own shadow DOM is not restyled.** Document
  stylesheets do not cross shadow boundaries. Inherited properties such as
  colour, line height and letter spacing still reach in from the host element.
  Backgrounds and borders do not.
- **High contrast removes background images.** That is what high contrast means,
  but sprite-based icons and gradient buttons lose their artwork.
- **Text scaling uses CSS `zoom`.** It is the only approach that moves
  pixel-based sites, and it is what browser zoom does, but fixed-position offsets
  scale with it. Worth a look on any site with unusual sticky layout.
- **Reduced motion only pauses media present when it is switched on.** Media
  added later keeps playing. Catching it would mean running an observer on every
  page view, which didn't seem worth the cost.
- **Configuration needs a script tag.** Importing the file through a bundler
  works, but there is no tag to carry data attributes, so the defaults apply.

## Browser support

Any browser from roughly 2020 onward. The hard requirements are shadow DOM and
`:where()`, which means Chrome and Edge 88, Firefox 78 and Safari 14.

Two features degrade gracefully on older versions:

- Without constructable stylesheets (before Firefox 101 and Safari 16.4), styles
  are applied through a `<style>` element, which a strict CSP may block.
- Without CSS `zoom` (before Firefox 126), the text size buttons have no effect.
  Every other feature still works.

## Development

```bash
npm install
npm run check     # format, typecheck, tests, build and size budget
npm run preview   # builds the demo site and serves it on http://localhost:8788
```

The demo pages live in `demo/`. `stress-test.html` covers fixed headers,
background-image heroes, pixel text and animation. `hostile-config.html` feeds
the script invalid attributes, including an attempt to inject CSS through the
accent colour. `strict-csp.html` runs the widget under a policy that blocks
inline styles and scripts and enforces Trusted Types.

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. In short,
a change that makes the script bigger or adds a dependency needs a strong reason.

## Licence

[MIT](LICENSE). Built and maintained by [QuickCasa](https://quickcasa.ai) in
Kitchener, Ontario.
