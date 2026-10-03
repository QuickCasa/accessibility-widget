import { PANEL_HOST_ID, SKIP_LINK_HOST_ID } from './constants'
import type { AccessibilityPreferences, ContrastMode } from './types'

/**
 * Replaced media never has its colours forced, otherwise photographs and logos
 * disappear behind a solid block in high contrast. Our own two shadow hosts are
 * excluded for the same reason: a forced background paints around the trigger.
 */
const COLOUR_FORCING_EXCLUSIONS = [
  'img',
  'picture',
  'video',
  'canvas',
  'svg',
  'iframe',
  'object',
  'embed',
  `#${PANEL_HOST_ID}`,
  `#${SKIP_LINK_HOST_ID}`,
].join(', ')

/**
 * The exclusion list is wrapped in :where() so that it contributes no
 * specificity at all.
 *
 * Written as a chain of :not() calls instead, the two id selectors would hand
 * the universal selector id-level specificity, and every later rule in this file
 * would lose to it. That is not theoretical: it turned high-contrast links white
 * instead of yellow, because a[href] was being outranked by `*`.
 */
const EVERY_ELEMENT = `*:where(:not(${COLOUR_FORCING_EXCLUSIONS}))`

interface ContrastPalette {
  background: string
  foreground: string
  link: string
  visited: string
}

const getContrastPalette = (mode: ContrastMode): ContrastPalette => {
  if (mode === 'dark') {
    return {
      background: '#000000',
      foreground: '#ffffff',
      link: '#ffff00',
      visited: '#e2a9ff',
    }
  }

  return {
    background: '#ffffff',
    foreground: '#000000',
    link: '#0000cc',
    visited: '#551a8b',
  }
}

/**
 * Forces a guaranteed-contrast palette using colour declarations only. No CSS
 * filter is used anywhere: a filter on the root element makes it a containing
 * block for fixed descendants, which silently breaks every sticky header on the
 * host site.
 * @param {ContrastMode} mode - The requested contrast mode.
 * @returns {string} The contrast rules, or an empty string when off.
 */
const buildContrastCss = (mode: ContrastMode): string => {
  if (mode === 'off') {
    return ''
  }

  const palette = getContrastPalette(mode)

  return (
    `html, body { background-color: ${palette.background} !important; color: ${palette.foreground} !important; }` +
    `${EVERY_ELEMENT} { background-color: ${palette.background} !important; color: ${palette.foreground} !important; border-color: ${palette.foreground} !important; background-image: none !important; box-shadow: none !important; text-shadow: none !important; }` +
    `svg * { background-color: transparent !important; }` +
    `a[href], a[href] ${EVERY_ELEMENT} { color: ${palette.link} !important; }` +
    `a[href]:visited, a[href]:visited ${EVERY_ELEMENT} { color: ${palette.visited} !important; }` +
    `input, textarea, select, button { background-color: ${palette.background} !important; color: ${palette.foreground} !important; border: 1px solid ${palette.foreground} !important; }` +
    `::placeholder { color: ${palette.foreground} !important; opacity: 0.75 !important; }` +
    `mark { background-color: ${palette.link} !important; color: ${palette.background} !important; }`
  )
}

/**
 * Applies the metrics from WCAG 1.4.12 Text Spacing. Tight designs can overflow
 * under these values, which is exactly the failure the criterion is meant to
 * expose, so it stays opt-in rather than on by default.
 * @param {boolean} isEnabled - Whether spacing is switched on.
 * @returns {string} The spacing rules, or an empty string.
 */
const buildTextSpacingCss = (isEnabled: boolean): string => {
  if (!isEnabled) {
    return ''
  }

  return (
    `${EVERY_ELEMENT} { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }` +
    'p, li, blockquote { margin-bottom: 2em !important; }'
  )
}

/**
 * Underlines real links only. Anchors without an href are usually script hooks,
 * and the :has() overrides keep image and icon links clean. Each override is a
 * separate rule so a browser without :has() support still gets the underlines.
 * @param {boolean} isEnabled - Whether underlining is switched on.
 * @returns {string} The underline rules, or an empty string.
 */
const buildLinkUnderlineCss = (isEnabled: boolean): string => {
  if (!isEnabled) {
    return ''
  }

  return (
    'a[href] { text-decoration: underline !important; text-underline-offset: 0.15em !important; }' +
    'a[href]:has(> img:only-child) { text-decoration: none !important; }' +
    'a[href]:has(> svg:only-child) { text-decoration: none !important; }'
  )
}

/**
 * Draws a two-tone focus ring. One of the two colours is always visible no
 * matter what the host site paints behind it, which a single-colour outline
 * cannot guarantee.
 * @param {boolean} isEnabled - Whether the enhanced ring is switched on.
 * @returns {string} The focus rules, or an empty string.
 */
const buildFocusOutlineCss = (isEnabled: boolean): string => {
  if (!isEnabled) {
    return ''
  }

  return ':focus-visible { outline: 3px solid #ffffff !important; outline-offset: 0 !important; box-shadow: 0 0 0 6px #000000 !important; }'
}

/**
 * Collapses animations and transitions to a duration short enough to be
 * imperceptible but non-zero, because host sites commonly wait on animationend
 * or transitionend to reveal content and a duration of zero can skip the event.
 * @param {boolean} isEnabled - Whether motion reduction is switched on.
 * @returns {string} The motion rules, or an empty string.
 */
const buildReduceMotionCss = (isEnabled: boolean): string => {
  if (!isEnabled) {
    return ''
  }

  return (
    '*, *::before, *::after { animation-duration: 0.001ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; transition-delay: 0s !important; }' +
    'html, body { scroll-behavior: auto !important; }'
  )
}

/**
 * Scales the page the same way the browser's own zoom does, which is the only
 * approach that also moves sites built entirely in pixels.
 *
 * Our own widget is counter-zoomed by the reciprocal so it stays a constant
 * size. Without that, its fixed positioning is scaled along with the page and
 * at the largest step the panel walks off the edge of the viewport.
 * @param {number} scale - The requested scale as a percentage.
 * @returns {string} The zoom rules, or an empty string at 100%.
 */
const buildTextScaleCss = (scale: number): string => {
  if (scale === 100) {
    return ''
  }

  const pageZoom = (scale / 100).toFixed(4)
  const widgetZoom = (100 / scale).toFixed(4)

  return (
    `body { zoom: ${pageZoom} !important; }` +
    `#${PANEL_HOST_ID}, #${SKIP_LINK_HOST_ID} { zoom: ${widgetZoom} !important; }`
  )
}

/**
 * Builds the complete stylesheet for the current preferences. Only the rules for
 * enabled features are emitted, so switching everything off leaves the host page
 * with no rules from us at all.
 * @param {AccessibilityPreferences} preferences - The visitor's current choices.
 * @returns {string} The stylesheet to apply to the document.
 */
const buildPageCss = (preferences: AccessibilityPreferences): string => {
  return [
    buildContrastCss(preferences.contrast),
    buildTextSpacingCss(preferences.textSpacing),
    buildLinkUnderlineCss(preferences.linkUnderline),
    buildReduceMotionCss(preferences.reduceMotion),
    buildFocusOutlineCss(preferences.focusOutline),
    buildTextScaleCss(preferences.textScale),
  ].join('')
}

export { buildPageCss }
