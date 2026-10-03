type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

type ContrastMode = 'off' | 'dark' | 'light'

type FeatureKey =
  | 'skip-link'
  | 'contrast'
  | 'text-size'
  | 'text-spacing'
  | 'link-underline'
  | 'focus-outline'
  | 'reduce-motion'

interface AccessibilityPreferences {
  contrast: ContrastMode
  textScale: number
  textSpacing: boolean
  linkUnderline: boolean
  focusOutline: boolean
  reduceMotion: boolean
}

interface AccessibilityConfig {
  mainContentSelector: string | null
  position: WidgetPosition
  accentColour: string
  features: FeatureKey[]
  storageKey: string
  triggerLabel: string
}

type IconName = 'accessibility' | 'close'

type ToggleKey =
  'textSpacing' | 'linkUnderline' | 'focusOutline' | 'reduceMotion'

interface ToggleDefinition {
  key: ToggleKey
  feature: FeatureKey
  label: string
}

interface PanelController {
  getPreferences: () => AccessibilityPreferences
  update: (changes: Partial<AccessibilityPreferences>) => void
  reset: () => void
}

interface TextScaleOption {
  value: number
  label: string
}

interface ContrastOption {
  value: ContrastMode
  label: string
}

/**
 * The shape read back out of localStorage. Every field is optional because the
 * value is user-editable and may have been written by an older version.
 */
interface StoredPreferences {
  contrast?: string
  textScale?: number
  textSpacing?: boolean
  linkUnderline?: boolean
  focusOutline?: boolean
  reduceMotion?: boolean
}

interface PreferenceStore {
  load: () => AccessibilityPreferences | null
  save: (preferences: AccessibilityPreferences) => void
  clear: () => void
}

interface AccessibilityApi {
  open: () => void
  close: () => void
  reset: () => void
  getPreferences: () => AccessibilityPreferences
}

export type {
  WidgetPosition,
  ContrastMode,
  FeatureKey,
  AccessibilityPreferences,
  AccessibilityConfig,
  IconName,
  ToggleKey,
  ToggleDefinition,
  PanelController,
  TextScaleOption,
  ContrastOption,
  StoredPreferences,
  PreferenceStore,
  AccessibilityApi,
}
