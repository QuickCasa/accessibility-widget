import {
  LABELS,
  MAIN_CONTENT_FALLBACK_ID,
  MAIN_CONTENT_FALLBACK_SELECTORS,
  SKIP_LINK_HOST_ID,
  WIDGET_Z_INDEX,
} from './constants'
import { adoptShadowCss } from './shadow-styles'
import type { AccessibilityConfig } from './types'

const NATIVELY_FOCUSABLE_PATTERN = /^(?:a|button|input|select|textarea)$/iu

const getSkipLinkCss = (accentColour: string): string => {
  return (
    `:host { all: initial; position: fixed; top: 0; left: 0; z-index: ${WIDGET_Z_INDEX}; }` +
    '.qc-skip { position: absolute; top: -200px; left: 8px; display: block; white-space: nowrap;' +
    ' padding: 12px 20px; background: #000000; color: #ffffff; border: 2px solid ' +
    accentColour +
    '; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
    ' font-size: 16px; font-weight: 600; line-height: 1.2; text-decoration: underline; transition: none; }' +
    '.qc-skip:focus { top: 8px; outline: 3px solid #ffffff; outline-offset: 2px; box-shadow: 0 0 0 6px #000000; }'
  )
}

/**
 * Finds the element the skip link should send the visitor to. The configured
 * selector wins, then the standard landmarks, then our own class convention.
 * @param {string | null} configuredSelector - The host site's own selector.
 * @returns {HTMLElement | null} The target element, or null when none exists.
 */
const resolveMainContent = (
  configuredSelector: string | null,
): HTMLElement | null => {
  const selectors = configuredSelector
    ? [configuredSelector, ...MAIN_CONTENT_FALLBACK_SELECTORS]
    : MAIN_CONTENT_FALLBACK_SELECTORS

  for (const selector of selectors) {
    try {
      const candidate = document.querySelector<HTMLElement>(selector)

      if (candidate) {
        return candidate
      }
    } catch {
      // An unparseable selector is skipped rather than aborting the chain.
    }
  }

  return null
}

/**
 * Moves keyboard focus, not just the scroll position. A plain fragment link
 * scrolls the page but leaves focus on the skip link itself in most browsers, so
 * the next Tab press carries on through the navigation the visitor just skipped.
 * @param {HTMLElement} target - The main content element.
 */
const moveFocusToTarget = (target: HTMLElement): void => {
  const isNativelyFocusable = NATIVELY_FOCUSABLE_PATTERN.test(target.tagName)

  if (!isNativelyFocusable && !target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1')
  }

  target.focus({ preventScroll: true })
  target.scrollIntoView({ block: 'start', inline: 'nearest' })
}

/**
 * Adds a "skip to main content" link as the first focusable element on the page.
 *
 * If no main content can be found the link is removed entirely, because a skip
 * link that goes nowhere both fails the criterion it is meant to satisfy and
 * wastes the first Tab press of every keyboard visitor.
 * @param {AccessibilityConfig} config - The resolved plugin configuration.
 */
const createSkipLink = (config: AccessibilityConfig): void => {
  if (document.getElementById(SKIP_LINK_HOST_ID)) {
    return
  }

  const host = document.createElement('div')
  host.id = SKIP_LINK_HOST_ID
  const shadow = host.attachShadow({ mode: 'open' })

  adoptShadowCss(shadow, getSkipLinkCss(config.accentColour))

  const link = document.createElement('a')
  link.className = 'qc-skip'
  link.href = '#'
  link.textContent = LABELS.skipLink

  const syncHref = (target: HTMLElement): void => {
    if (!target.id) {
      target.id = MAIN_CONTENT_FALLBACK_ID
    }

    link.href = `#${target.id}`
  }

  link.addEventListener('click', (clickEvent: MouseEvent) => {
    clickEvent.preventDefault()

    const target = resolveMainContent(config.mainContentSelector)

    if (!target) {
      return
    }

    syncHref(target)
    moveFocusToTarget(target)
  })

  shadow.appendChild(link)
  document.body.prepend(host)

  const initialTarget = resolveMainContent(config.mainContentSelector)

  if (initialTarget) {
    syncHref(initialTarget)
    return
  }

  const settleOrRemove = (): void => {
    const lateTarget = resolveMainContent(config.mainContentSelector)

    if (lateTarget) {
      syncHref(lateTarget)
      return
    }

    console.warn(
      '[QC Accessibility] No main content element found, so the skip link was removed. Add a <main> element or set data-main-content-selector on the script tag.',
    )
    host.remove()
  }

  if (document.readyState === 'complete') {
    settleOrRemove()
    return
  }

  window.addEventListener('load', settleOrRemove, { once: true })
}

export { createSkipLink }
