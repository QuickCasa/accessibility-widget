/**
 * Styles one of the widget's own shadow roots.
 *
 * A style element inside a shadow root is still an inline style as far as a
 * Content-Security-Policy is concerned, so on a site without style-src
 * 'unsafe-inline' it would be blocked and the widget would render unstyled. A
 * constructed stylesheet is not inline, so it is used wherever the browser
 * supports one. A style element is the fallback for older browsers only.
 * @param {ShadowRoot} shadow - The shadow root to style.
 * @param {string} css - The complete stylesheet for that root.
 */
const adoptShadowCss = (shadow: ShadowRoot, css: string): void => {
  if ('adoptedStyleSheets' in shadow) {
    try {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(css)
      shadow.adoptedStyleSheets = [sheet]
      return
    } catch {
      // Constructable stylesheets are unsupported, so fall back below.
    }
  }

  const styleElement = document.createElement('style')
  styleElement.textContent = css
  shadow.appendChild(styleElement)
}

export { adoptShadowCss }
