import type {
  AccessibilityPreferences,
  ContrastOption,
  FeatureKey,
  TextScaleOption,
  ToggleDefinition,
} from './types'

const DEFAULT_STORAGE_KEY = 'qc_a11y_v1'

/**
 * Sits just below the 32-bit signed maximum so a host site can still place
 * something above the widget deliberately without having to guess our value.
 */
const WIDGET_Z_INDEX = 2147483000

const DEFAULT_ACCENT_COLOUR = '#6A24FF'

const SKIP_LINK_HOST_ID = 'qc-a11y-skip-link'
const PANEL_HOST_ID = 'qc-a11y-panel'
const MAIN_CONTENT_FALLBACK_ID = 'qc-a11y-main-content'
const STYLE_ELEMENT_ID = 'qc-a11y-page-styles'

/**
 * Ordered from most to least authoritative. The native `main` element wins over
 * our own `.main-content` convention because it is the standard and needs no
 * cooperation from the host site.
 */
const MAIN_CONTENT_FALLBACK_SELECTORS = [
  'main',
  '[role="main"]',
  '.main-content',
  '#main',
  '#main-content',
  '#content',
]

const ALL_FEATURES: FeatureKey[] = [
  'skip-link',
  'contrast',
  'text-size',
  'text-spacing',
  'link-underline',
  'focus-outline',
  'reduce-motion',
]

const TEXT_SCALE_OPTIONS: TextScaleOption[] = [
  { value: 100, label: 'Default' },
  { value: 115, label: 'Large' },
  { value: 130, label: 'Larger' },
  { value: 150, label: 'Largest' },
]

const CONTRAST_OPTIONS: ContrastOption[] = [
  { value: 'off', label: 'Off' },
  { value: 'dark', label: 'Light on dark' },
  { value: 'light', label: 'Dark on light' },
]

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  contrast: 'off',
  textScale: 100,
  textSpacing: false,
  linkUnderline: false,
  focusOutline: false,
  reduceMotion: false,
}

const HEX_COLOUR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/iu

const LABELS = {
  skipLink: 'Skip to main content',
  triggerLabel: 'Accessibility options',
  panelTitle: 'Accessibility',
  closePanel: 'Close accessibility options',
  contrastGroup: 'Colour contrast',
  textSizeGroup: 'Text size',
  textSpacing: 'Increase text spacing',
  linkUnderline: 'Underline all links',
  focusOutline: 'Highlight keyboard focus',
  reduceMotion: 'Reduce motion',
  reset: 'Reset all settings',
  footnote: 'Your choices are saved on this device only.',
  resetAnnouncement: 'All accessibility settings reset',
  onWord: 'on',
  offWord: 'off',
}

const TOGGLE_DEFINITIONS: ToggleDefinition[] = [
  { key: 'textSpacing', feature: 'text-spacing', label: LABELS.textSpacing },
  {
    key: 'linkUnderline',
    feature: 'link-underline',
    label: LABELS.linkUnderline,
  },
  { key: 'focusOutline', feature: 'focus-outline', label: LABELS.focusOutline },
  { key: 'reduceMotion', feature: 'reduce-motion', label: LABELS.reduceMotion },
]

export {
  DEFAULT_STORAGE_KEY,
  WIDGET_Z_INDEX,
  DEFAULT_ACCENT_COLOUR,
  SKIP_LINK_HOST_ID,
  PANEL_HOST_ID,
  MAIN_CONTENT_FALLBACK_ID,
  STYLE_ELEMENT_ID,
  MAIN_CONTENT_FALLBACK_SELECTORS,
  ALL_FEATURES,
  TEXT_SCALE_OPTIONS,
  CONTRAST_OPTIONS,
  DEFAULT_PREFERENCES,
  HEX_COLOUR_PATTERN,
  LABELS,
  TOGGLE_DEFINITIONS,
}
