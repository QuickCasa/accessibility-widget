import { describe, expect, it } from 'vitest'
import { DEFAULT_PREFERENCES } from '../src/constants'
import { buildPageCss } from '../src/page-styles'
import type { AccessibilityPreferences } from '../src/types'

const FILTER_DECLARATION = /(?:^|[\s;{])filter\s*:/u

const withPreferences = (
  changes: Partial<AccessibilityPreferences>,
): AccessibilityPreferences => ({ ...DEFAULT_PREFERENCES, ...changes })

const EVERYTHING_ON = withPreferences({
  contrast: 'dark',
  textScale: 150,
  textSpacing: true,
  linkUnderline: true,
  focusOutline: true,
  reduceMotion: true,
})

describe('buildPageCss', () => {
  it('emits nothing at all when every preference is at its default', () => {
    expect(buildPageCss(DEFAULT_PREFERENCES)).toBe('')
  })

  it('never uses a CSS filter, which would break fixed headers', () => {
    expect(buildPageCss(EVERYTHING_ON)).not.toMatch(FILTER_DECLARATION)
    expect(buildPageCss(withPreferences({ contrast: 'light' }))).not.toMatch(
      FILTER_DECLARATION,
    )
  })

  it('forces a light-on-dark palette with yellow links', () => {
    const css = buildPageCss(withPreferences({ contrast: 'dark' }))

    expect(css).toContain('background-color: #000000 !important')
    expect(css).toContain('color: #ffffff !important')
    expect(css).toContain('color: #ffff00 !important')
  })

  it('forces a dark-on-light palette with blue links', () => {
    const css = buildPageCss(withPreferences({ contrast: 'light' }))

    expect(css).toContain('background-color: #ffffff !important')
    expect(css).toContain('color: #0000cc !important')
  })

  it('keeps the colour exclusions at zero specificity', () => {
    const css = buildPageCss(withPreferences({ contrast: 'dark' }))

    expect(css).toContain('*:where(:not(img, picture, video')
    expect(css).not.toMatch(/\*:not\(#/u)
  })

  it('scales the page and counter-zooms the widget by the reciprocal', () => {
    const css = buildPageCss(withPreferences({ textScale: 150 }))

    expect(css).toContain('body { zoom: 1.5000 !important; }')
    expect(css).toContain(
      '#qc-a11y-panel, #qc-a11y-skip-link { zoom: 0.6667 !important; }',
    )
  })

  it('applies the WCAG 1.4.12 text spacing metrics', () => {
    const css = buildPageCss(withPreferences({ textSpacing: true }))

    expect(css).toContain('line-height: 1.5 !important')
    expect(css).toContain('letter-spacing: 0.12em !important')
    expect(css).toContain('word-spacing: 0.16em !important')
  })

  it('underlines real links but not image-only links', () => {
    const css = buildPageCss(withPreferences({ linkUnderline: true }))

    expect(css).toContain('a[href] { text-decoration: underline !important;')
    expect(css).toContain(
      'a[href]:has(> img:only-child) { text-decoration: none !important; }',
    )
  })

  it('keeps animation durations above zero so end events still fire', () => {
    const css = buildPageCss(withPreferences({ reduceMotion: true }))

    expect(css).toContain('animation-duration: 0.001ms !important')
    expect(css).not.toContain('animation-duration: 0s')
  })
})
