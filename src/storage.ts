import {
  CONTRAST_OPTIONS,
  DEFAULT_PREFERENCES,
  TEXT_SCALE_OPTIONS,
} from './constants'
import type {
  AccessibilityPreferences,
  ContrastMode,
  PreferenceStore,
  StoredPreferences,
} from './types'

const readContrast = (value: string | undefined): ContrastMode => {
  const match = CONTRAST_OPTIONS.find(option => option.value === value)

  return match ? match.value : DEFAULT_PREFERENCES.contrast
}

const readTextScale = (value: number | undefined): number => {
  const match = TEXT_SCALE_OPTIONS.find(option => option.value === value)

  return match ? match.value : DEFAULT_PREFERENCES.textScale
}

const readBoolean = (
  value: boolean | undefined,
  fallback: boolean,
): boolean => {
  if (typeof value === 'boolean') {
    return value
  }

  return fallback
}

/**
 * Stored preferences are user-editable and can be left over from an older
 * version of this script, so every field is validated rather than trusted.
 * @param {StoredPreferences} raw - The parsed contents of storage.
 * @returns {AccessibilityPreferences} A complete, valid preference set.
 */
const sanitisePreferences = (
  raw: StoredPreferences,
): AccessibilityPreferences => {
  return {
    contrast: readContrast(raw.contrast),
    textScale: readTextScale(raw.textScale),
    textSpacing: readBoolean(raw.textSpacing, DEFAULT_PREFERENCES.textSpacing),
    linkUnderline: readBoolean(
      raw.linkUnderline,
      DEFAULT_PREFERENCES.linkUnderline,
    ),
    focusOutline: readBoolean(
      raw.focusOutline,
      DEFAULT_PREFERENCES.focusOutline,
    ),
    reduceMotion: readBoolean(
      raw.reduceMotion,
      DEFAULT_PREFERENCES.reduceMotion,
    ),
  }
}

/**
 * Creates a reader and writer for the visitor's saved preferences. Every access
 * is guarded because private browsing modes and cookie-blocking extensions both
 * make localStorage throw rather than return null.
 * @param {string} storageKey - The localStorage key to read and write.
 * @returns {PreferenceStore} The store interface.
 */
const createPreferenceStore = (storageKey: string): PreferenceStore => {
  const load = (): AccessibilityPreferences | null => {
    try {
      const stored = window.localStorage.getItem(storageKey)

      if (!stored) {
        return null
      }

      const parsed = JSON.parse(stored) as StoredPreferences

      if (typeof parsed !== 'object' || parsed === null) {
        return null
      }

      return sanitisePreferences(parsed)
    } catch {
      return null
    }
  }

  const save = (preferences: AccessibilityPreferences): void => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(preferences))
    } catch {
      // Storage is unavailable, so preferences last for this page view only.
    }
  }

  const clear = (): void => {
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      // Nothing to do, the value was never written.
    }
  }

  return { load, save, clear }
}

export { createPreferenceStore }
