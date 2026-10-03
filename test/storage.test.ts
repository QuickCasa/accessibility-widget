import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PREFERENCES } from '../src/constants'
import { createPreferenceStore } from '../src/storage'
import type { AccessibilityPreferences } from '../src/types'

const STORAGE_KEY = 'test_a11y'

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('createPreferenceStore', () => {
  it('returns null when nothing is stored', () => {
    expect(createPreferenceStore(STORAGE_KEY).load()).toBeNull()
  })

  it('round-trips a saved preference set', () => {
    const store = createPreferenceStore(STORAGE_KEY)
    const preferences: AccessibilityPreferences = {
      ...DEFAULT_PREFERENCES,
      contrast: 'light',
      textScale: 130,
      focusOutline: true,
    }

    store.save(preferences)

    expect(store.load()).toEqual(preferences)
  })

  it('returns null for stored values that are not JSON objects', () => {
    const store = createPreferenceStore(STORAGE_KEY)

    window.localStorage.setItem(STORAGE_KEY, '{not json')
    expect(store.load()).toBeNull()

    window.localStorage.setItem(STORAGE_KEY, 'null')
    expect(store.load()).toBeNull()

    window.localStorage.setItem(STORAGE_KEY, '42')
    expect(store.load()).toBeNull()
  })

  it('replaces every invalid field with its default', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        contrast: 'rainbow',
        textScale: 999,
        textSpacing: 'yes',
        linkUnderline: 1,
        focusOutline: true,
      }),
    )

    expect(createPreferenceStore(STORAGE_KEY).load()).toEqual({
      ...DEFAULT_PREFERENCES,
      focusOutline: true,
    })
  })

  it('survives storage that throws, as private browsing modes do', () => {
    const storagePrototype = Object.getPrototypeOf(window.localStorage)
    const failure = (): never => {
      throw new Error('SecurityError')
    }

    vi.spyOn(storagePrototype, 'getItem').mockImplementation(failure)
    vi.spyOn(storagePrototype, 'setItem').mockImplementation(failure)
    vi.spyOn(storagePrototype, 'removeItem').mockImplementation(failure)

    const store = createPreferenceStore(STORAGE_KEY)

    expect(store.load()).toBeNull()
    expect(() => store.save(DEFAULT_PREFERENCES)).not.toThrow()
    expect(() => store.clear()).not.toThrow()
  })
})
