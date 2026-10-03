import { STYLE_ELEMENT_ID } from './constants'

let adoptedSheet: CSSStyleSheet | null = null
let hasAttemptedAdoption = false
let fallbackElement: HTMLStyleElement | null = null

/**
 * A constructed stylesheet is preferred over injecting a style element because
 * it is not an inline style, so it survives a host site running a strict
 * Content-Security-Policy without style-src 'unsafe-inline'.
 * @returns {CSSStyleSheet | null} The adopted sheet, or null if unsupported.
 */
const getAdoptedSheet = (): CSSStyleSheet | null => {
  if (hasAttemptedAdoption) {
    return adoptedSheet
  }

  hasAttemptedAdoption = true

  try {
    const sheet = new CSSStyleSheet()
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
    adoptedSheet = sheet
  } catch {
    adoptedSheet = null
  }

  return adoptedSheet
}

const applyViaStyleElement = (css: string): void => {
  if (!fallbackElement) {
    fallbackElement = document.createElement('style')
    fallbackElement.id = STYLE_ELEMENT_ID
    const parent = document.head || document.documentElement
    parent.appendChild(fallbackElement)
  }

  fallbackElement.textContent = css
}

/**
 * Replaces every rule this script contributes to the host document. Passing an
 * empty string is how the page is returned to its untouched state.
 * @param {string} css - The complete stylesheet to apply.
 */
const applyDocumentCss = (css: string): void => {
  try {
    const sheet = getAdoptedSheet()

    if (sheet) {
      sheet.replaceSync(css)
      return
    }

    applyViaStyleElement(css)
  } catch (error) {
    console.warn('[QC Accessibility] Could not apply styles.', error)
  }
}

export { applyDocumentCss }
