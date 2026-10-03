import { DEFAULT_PREFERENCES } from './constants'
import { readConfig } from './config'
import { createPreferenceStore } from './storage'
import { buildPageCss } from './page-styles'
import { applyDocumentCss } from './stylesheet'
import { pauseAutoplayingMedia } from './motion'
import { createSkipLink } from './skip-link'
import { createAccessibilityPanel } from './panel'
import type {
  AccessibilityApi,
  AccessibilityPreferences,
  FeatureKey,
  PanelController,
  PreferenceStore,
} from './types'

declare global {
  interface Window {
    QuickCasaAccessibility?: AccessibilityApi
    QuickCasaAccessibilityLoaded?: boolean
  }
}

/**
 * Drops any preference whose feature the host site has switched off, so a stored
 * choice cannot keep applying after the site stops offering that control.
 * @param {AccessibilityPreferences} preferences - The visitor's saved choices.
 * @param {FeatureKey[]} features - The features this site has enabled.
 * @returns {AccessibilityPreferences} The choices that may actually be applied.
 */
const maskDisabledFeatures = (
  preferences: AccessibilityPreferences,
  features: FeatureKey[],
): AccessibilityPreferences => {
  return {
    contrast: features.includes('contrast')
      ? preferences.contrast
      : DEFAULT_PREFERENCES.contrast,
    textScale: features.includes('text-size')
      ? preferences.textScale
      : DEFAULT_PREFERENCES.textScale,
    textSpacing: features.includes('text-spacing') && preferences.textSpacing,
    linkUnderline:
      features.includes('link-underline') && preferences.linkUnderline,
    focusOutline:
      features.includes('focus-outline') && preferences.focusOutline,
    reduceMotion:
      features.includes('reduce-motion') && preferences.reduceMotion,
  }
}

const prefersReducedMotion = (): boolean => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/**
 * Works out the starting preferences. With nothing saved, the operating system's
 * own motion preference is honoured rather than overridden.
 *
 * That seeded value is deliberately not written to storage. Persisting it would
 * freeze today's operating system setting in place and start ignoring the
 * visitor if they ever changed it.
 * @param {PreferenceStore} store - The preference store to read from.
 * @param {FeatureKey[]} features - The features this site has enabled.
 * @returns {AccessibilityPreferences} The preferences to start from.
 */
const resolveInitialPreferences = (
  store: PreferenceStore,
  features: FeatureKey[],
): AccessibilityPreferences => {
  const stored = store.load()

  if (stored) {
    return stored
  }

  return {
    ...DEFAULT_PREFERENCES,
    reduceMotion: features.includes('reduce-motion') && prefersReducedMotion(),
  }
}

const initialise = (): void => {
  const config = readConfig()
  const store = createPreferenceStore(config.storageKey)

  let preferences = resolveInitialPreferences(store, config.features)

  const applyPreferences = (): void => {
    const effective = maskDisabledFeatures(preferences, config.features)

    applyDocumentCss(buildPageCss(effective))

    if (effective.reduceMotion) {
      pauseAutoplayingMedia()
    }
  }

  applyPreferences()

  const controller: PanelController = {
    getPreferences: () => preferences,
    update: changes => {
      preferences = { ...preferences, ...changes }
      store.save(preferences)
      applyPreferences()
    },
    reset: () => {
      store.clear()
      preferences = resolveInitialPreferences(store, config.features)
      applyPreferences()
    },
  }

  const buildInterface = (): void => {
    try {
      if (config.features.includes('skip-link')) {
        createSkipLink(config)
      }

      const api = createAccessibilityPanel(config, controller)

      if (api) {
        window.QuickCasaAccessibility = api
      }
    } catch (error) {
      console.error('[QC Accessibility] Could not build the widget.', error)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildInterface, {
      once: true,
    })
    return
  }

  buildInterface()
}

/**
 * Styles are applied the moment this file runs, before the widget exists, so a
 * returning visitor does not see the unmodified page first. Everything is
 * wrapped because a script whose entire purpose is accessibility must never be
 * the reason a host site stops working.
 */
if (window.QuickCasaAccessibilityLoaded) {
  console.info(
    '[QC Accessibility] Already loaded on this page, ignoring the duplicate script tag.',
  )
} else {
  window.QuickCasaAccessibilityLoaded = true

  try {
    initialise()
  } catch (error) {
    console.error('[QC Accessibility] Initialisation failed.', error)
  }
}
