import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_STORAGE_KEY,
  PANEL_HOST_ID,
  SKIP_LINK_HOST_ID,
  STYLE_ELEMENT_ID,
} from '../src/constants'

/**
 * Loads the widget exactly as a page would: a script tag carrying the data
 * attributes, then the entry file running its side effects. The module cache
 * is reset first so every test gets a fresh copy.
 * @param {Record<string, string>} attributes - Data attributes for the tag.
 */
const loadWidget = async (
  attributes: Record<string, string> = {},
): Promise<void> => {
  const script = document.createElement('script')
  script.setAttribute('data-qc-accessibility', '')

  for (const [name, value] of Object.entries(attributes)) {
    script.setAttribute(name, value)
  }

  document.head.appendChild(script)
  vi.resetModules()
  await import('../src/index')
}

const getShadow = (hostId: string): ShadowRoot => {
  const shadow = document.getElementById(hostId)?.shadowRoot

  if (!shadow) {
    throw new Error(`No shadow root on #${hostId}`)
  }

  return shadow
}

const getElement = <ElementType extends HTMLElement>(
  shadow: ShadowRoot,
  selector: string,
): ElementType => {
  const element = shadow.querySelector<ElementType>(selector)

  if (!element) {
    throw new Error(`Nothing matches ${selector}`)
  }

  return element
}

const getButton = (shadow: ShadowRoot, text: string): HTMLButtonElement => {
  const match = Array.from(shadow.querySelectorAll('button')).find(button =>
    button.textContent?.includes(text),
  )

  if (!match) {
    throw new Error(`No button containing "${text}"`)
  }

  return match
}

/**
 * jsdom has no constructable stylesheets, so the widget takes its documented
 * fallback and writes a style element. Reading that element is how these tests
 * see what the host page was given.
 * @returns {string} The CSS currently applied to the host document.
 */
const getAppliedCss = (): string =>
  document.getElementById(STYLE_ELEMENT_ID)?.textContent ?? ''

const readStoredPreferences = (): Record<string, string | number | boolean> =>
  JSON.parse(window.localStorage.getItem(DEFAULT_STORAGE_KEY) ?? '{}')

beforeEach(() => {
  document.body.innerHTML = '<main><h1>Page</h1></main>'
})

afterEach(() => {
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  window.localStorage.clear()
  delete window.QuickCasaAccessibility
  delete window.QuickCasaAccessibilityLoaded
  vi.restoreAllMocks()
})

describe('the widget', () => {
  it('renders a trigger, a hidden dialog and a skip link', async () => {
    await loadWidget()

    const shadow = getShadow(PANEL_HOST_ID)
    const trigger = getElement<HTMLButtonElement>(shadow, '.qc-trigger')
    const panel = getElement<HTMLElement>(shadow, '.qc-panel')

    expect(trigger.getAttribute('aria-label')).toBe('Accessibility options')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hidden).toBe(true)
    expect(panel.getAttribute('role')).toBe('dialog')

    const skipLink = getElement<HTMLAnchorElement>(
      getShadow(SKIP_LINK_HOST_ID),
      'a',
    )
    expect(skipLink.textContent).toBe('Skip to main content')
    expect(skipLink.getAttribute('href')).toBe('#qc-a11y-main-content')
  })

  it('makes the skip link the first element on the page', async () => {
    await loadWidget()

    expect(document.body.firstElementChild?.id).toBe(SKIP_LINK_HOST_ID)
  })

  it('moves keyboard focus to the main content when skipping', async () => {
    // jsdom does no layout, so it has no scrollIntoView to call.
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView

    await loadWidget()

    getElement<HTMLAnchorElement>(getShadow(SKIP_LINK_HOST_ID), 'a').click()

    const main = document.querySelector('main')
    expect(document.activeElement).toBe(main)
    expect(main?.getAttribute('tabindex')).toBe('-1')
    expect(scrollIntoView).toHaveBeenCalledOnce()

    Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  })

  it('opens and closes the panel, returning focus on Escape', async () => {
    await loadWidget()

    const shadow = getShadow(PANEL_HOST_ID)
    const trigger = getElement<HTMLButtonElement>(shadow, '.qc-trigger')
    const panel = getElement<HTMLElement>(shadow, '.qc-panel')

    trigger.click()
    expect(panel.hidden).toBe(false)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    panel.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    expect(panel.hidden).toBe(true)
    expect(shadow.activeElement).toBe(trigger)
  })

  it('applies, persists and announces a contrast change', async () => {
    await loadWidget()

    const shadow = getShadow(PANEL_HOST_ID)
    getButton(shadow, 'Light on dark').click()

    expect(getAppliedCss()).toContain('#000000')
    expect(readStoredPreferences()).toMatchObject({ contrast: 'dark' })
    expect(getElement<HTMLElement>(shadow, '.qc-live').textContent).toBe(
      'Colour contrast: Light on dark',
    )
  })

  it('restores saved preferences as soon as it loads', async () => {
    window.localStorage.setItem(
      DEFAULT_STORAGE_KEY,
      JSON.stringify({ contrast: 'light', textScale: 130 }),
    )

    await loadWidget()

    expect(getAppliedCss()).toContain('body { zoom: 1.3000 !important; }')
    expect(window.QuickCasaAccessibility?.getPreferences().contrast).toBe(
      'light',
    )
  })

  it('resets everything and leaves the page untouched', async () => {
    await loadWidget()

    const shadow = getShadow(PANEL_HOST_ID)
    getButton(shadow, 'Largest').click()
    getButton(shadow, 'Underline all links').click()
    expect(getAppliedCss()).not.toBe('')

    getButton(shadow, 'Reset all settings').click()

    expect(getAppliedCss()).toBe('')
    expect(window.localStorage.getItem(DEFAULT_STORAGE_KEY)).toBeNull()
  })

  it('only offers the features the host site enabled', async () => {
    await loadWidget({ 'data-features': 'contrast' })

    const shadow = getShadow(PANEL_HOST_ID)

    expect(shadow.textContent).toContain('Colour contrast')
    expect(shadow.textContent).not.toContain('Text size')
    expect(shadow.textContent).not.toContain('Reduce motion')
    expect(document.getElementById(SKIP_LINK_HOST_ID)).toBeNull()
  })

  it('ignores stored choices for features the site switched off', async () => {
    window.localStorage.setItem(
      DEFAULT_STORAGE_KEY,
      JSON.stringify({ contrast: 'dark', textScale: 150 }),
    )

    await loadWidget({ 'data-features': 'text-size' })

    const css = getAppliedCss()
    expect(css).toContain('zoom: 1.5000')
    expect(css).not.toContain('#000000')
  })

  it('ignores a second copy of the script on the same page', async () => {
    const information = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined)

    await loadWidget()
    await loadWidget()

    expect(document.querySelectorAll(`#${PANEL_HOST_ID}`)).toHaveLength(1)
    expect(information).toHaveBeenCalledOnce()
  })

  it('exposes a small public API on window', async () => {
    await loadWidget()

    const api = window.QuickCasaAccessibility
    const panel = getElement<HTMLElement>(getShadow(PANEL_HOST_ID), '.qc-panel')

    api?.open()
    expect(panel.hidden).toBe(false)

    api?.close()
    expect(panel.hidden).toBe(true)
  })
})
