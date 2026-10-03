import {
  ALL_FEATURES,
  DEFAULT_ACCENT_COLOUR,
  DEFAULT_STORAGE_KEY,
  HEX_COLOUR_PATTERN,
  LABELS,
} from './constants'
import type { AccessibilityConfig, FeatureKey, WidgetPosition } from './types'

const VALID_POSITIONS: WidgetPosition[] = [
  'bottom-right',
  'bottom-left',
  'top-right',
  'top-left',
]

/**
 * Finds the script tag that loaded this file, so its data attributes can be
 * read. `document.currentScript` covers almost every case, including deferred
 * and dynamically injected classic scripts. The explicit marker attribute and
 * the URL patterns are fallbacks for the rare loader that clears it.
 * @returns {HTMLScriptElement | null} Our script tag, or null if none is found.
 */
const findScriptTag = (): HTMLScriptElement | null => {
  if (
    document.currentScript &&
    document.currentScript instanceof HTMLScriptElement
  ) {
    return document.currentScript
  }

  const tagged = document.querySelector<HTMLScriptElement>(
    'script[data-qc-accessibility]',
  )

  if (tagged) {
    return tagged
  }

  return document.querySelector<HTMLScriptElement>(
    'script[src*="/accessibility/"], script[src*="/accessibility-widget"]',
  )
}

/**
 * Confirms a selector is syntactically valid without caring whether it currently
 * matches anything, so a single-page app that has not rendered yet is not
 * mistaken for a typo.
 * @param {string} selector - The CSS selector to test.
 * @returns {boolean} True when the browser can parse the selector.
 */
const isValidSelector = (selector: string): boolean => {
  try {
    document.createDocumentFragment().querySelector(selector)
    return true
  } catch {
    return false
  }
}

const readMainContentSelector = (
  scriptTag: HTMLScriptElement | null,
): string | null => {
  const value = scriptTag?.getAttribute('data-main-content-selector')?.trim()

  if (!value) {
    return null
  }

  if (!isValidSelector(value)) {
    console.warn(
      `[QC Accessibility] data-main-content-selector is not a valid CSS selector: "${value}". Falling back to automatic detection.`,
    )
    return null
  }

  return value
}

const readPosition = (scriptTag: HTMLScriptElement | null): WidgetPosition => {
  const value = scriptTag?.getAttribute('data-position')?.trim().toLowerCase()
  const match = VALID_POSITIONS.find(position => position === value)

  return match || 'bottom-right'
}

/**
 * Only hex colours are accepted. The value is interpolated straight into a
 * stylesheet, so anything looser would let a host site inject arbitrary CSS
 * through its own script tag.
 * @param {HTMLScriptElement | null} scriptTag - The tag carrying our attributes.
 * @returns {string} A safe hex colour.
 */
const readAccentColour = (scriptTag: HTMLScriptElement | null): string => {
  const value = scriptTag?.getAttribute('data-accent')?.trim()

  if (!value) {
    return DEFAULT_ACCENT_COLOUR
  }

  if (!HEX_COLOUR_PATTERN.test(value)) {
    console.warn(
      `[QC Accessibility] data-accent must be a hex colour such as #6A24FF. Ignoring "${value}".`,
    )
    return DEFAULT_ACCENT_COLOUR
  }

  return value
}

const readFeatures = (scriptTag: HTMLScriptElement | null): FeatureKey[] => {
  const value = scriptTag?.getAttribute('data-features')?.trim()

  if (!value) {
    return ALL_FEATURES
  }

  const requested = value
    .split(',')
    .map(entry => entry.trim().toLowerCase())
    .filter(entry => entry.length > 0)

  const resolved = ALL_FEATURES.filter(feature => requested.includes(feature))

  if (resolved.length === 0) {
    console.warn(
      `[QC Accessibility] data-features matched no known features: "${value}". Enabling all of them.`,
    )
    return ALL_FEATURES
  }

  return resolved
}

/**
 * Reads every setting from data attributes on our own script tag. There is no
 * remote configuration and no API key, so a missing script tag simply means the
 * defaults apply.
 * @returns {AccessibilityConfig} The resolved, validated configuration.
 */
const readConfig = (): AccessibilityConfig => {
  const scriptTag = findScriptTag()

  return {
    mainContentSelector: readMainContentSelector(scriptTag),
    position: readPosition(scriptTag),
    accentColour: readAccentColour(scriptTag),
    features: readFeatures(scriptTag),
    storageKey:
      scriptTag?.getAttribute('data-storage-key')?.trim() ||
      DEFAULT_STORAGE_KEY,
    triggerLabel:
      scriptTag?.getAttribute('data-button-label')?.trim() ||
      LABELS.triggerLabel,
  }
}

export { readConfig }
