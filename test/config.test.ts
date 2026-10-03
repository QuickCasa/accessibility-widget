import { afterEach, describe, expect, it, vi } from 'vitest'
import { readConfig } from '../src/config'
import {
  ALL_FEATURES,
  DEFAULT_ACCENT_COLOUR,
  DEFAULT_STORAGE_KEY,
  LABELS,
} from '../src/constants'

const addScriptTag = (attributes: Record<string, string>): void => {
  const script = document.createElement('script')
  script.setAttribute('data-qc-accessibility', '')

  for (const [name, value] of Object.entries(attributes)) {
    script.setAttribute(name, value)
  }

  document.head.appendChild(script)
}

const silenceWarnings = () =>
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)

afterEach(() => {
  document.head.innerHTML = ''
  vi.restoreAllMocks()
})

describe('readConfig', () => {
  it('falls back to defaults when no script tag can be found', () => {
    expect(readConfig()).toEqual({
      mainContentSelector: null,
      position: 'bottom-right',
      accentColour: DEFAULT_ACCENT_COLOUR,
      features: ALL_FEATURES,
      storageKey: DEFAULT_STORAGE_KEY,
      triggerLabel: LABELS.triggerLabel,
    })
  })

  it('reads every supported data attribute', () => {
    addScriptTag({
      'data-main-content-selector': '#content',
      'data-position': 'TOP-LEFT',
      'data-accent': '#0F62FE',
      'data-features': 'contrast, text-size',
      'data-storage-key': 'acme_a11y',
      'data-button-label': 'Accessibility',
    })

    expect(readConfig()).toEqual({
      mainContentSelector: '#content',
      position: 'top-left',
      accentColour: '#0F62FE',
      features: ['contrast', 'text-size'],
      storageKey: 'acme_a11y',
      triggerLabel: 'Accessibility',
    })
  })

  it('finds the tag by its URL when the marker attribute is missing', () => {
    const script = document.createElement('script')
    script.src =
      'https://quickcasa.github.io/accessibility-widget/accessibility.js'
    script.setAttribute('data-position', 'bottom-left')
    document.head.appendChild(script)

    expect(readConfig().position).toBe('bottom-left')
  })

  it('rejects an accent colour that tries to inject CSS', () => {
    const warning = silenceWarnings()

    addScriptTag({
      'data-accent': 'red; } body { display: none !important; } .x {',
    })

    expect(readConfig().accentColour).toBe(DEFAULT_ACCENT_COLOUR)
    expect(warning).toHaveBeenCalledOnce()
  })

  it('rejects named colours and other non-hex values', () => {
    silenceWarnings()

    addScriptTag({ 'data-accent': 'rebeccapurple' })

    expect(readConfig().accentColour).toBe(DEFAULT_ACCENT_COLOUR)
  })

  it('ignores a selector the browser cannot parse', () => {
    silenceWarnings()

    addScriptTag({ 'data-main-content-selector': ':::not-a-valid-selector' })

    expect(readConfig().mainContentSelector).toBeNull()
  })

  it('enables every feature when none of the requested ones exist', () => {
    silenceWarnings()

    addScriptTag({ 'data-features': 'nonsense-feature,another-fake-one' })

    expect(readConfig().features).toEqual(ALL_FEATURES)
  })

  it('falls back to the default position for an unknown value', () => {
    addScriptTag({ 'data-position': 'upside-down' })

    expect(readConfig().position).toBe('bottom-right')
  })
})
