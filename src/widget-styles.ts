import { WIDGET_Z_INDEX } from './constants'
import type { WidgetPosition } from './types'

const getAnchorStyles = (position: WidgetPosition): string => {
  switch (position) {
    case 'bottom-left': {
      return 'bottom: 20px; left: 20px;'
    }
    case 'top-right': {
      return 'top: 20px; right: 20px;'
    }
    case 'top-left': {
      return 'top: 20px; left: 20px;'
    }
    default: {
      return 'bottom: 20px; right: 20px;'
    }
  }
}

const getPanelAnchorStyles = (position: WidgetPosition): string => {
  const vertical = position.startsWith('bottom')
    ? 'bottom: calc(100% + 12px);'
    : 'top: calc(100% + 12px);'

  const horizontal = position.endsWith('right') ? 'right: 0;' : 'left: 0;'

  return vertical + ' ' + horizontal
}

/**
 * Builds the widget's own stylesheet.
 *
 * The accent colour is used only for borders and focus rings, never as a
 * background behind text. A host site can pass any hex value it likes, and if
 * the accent were load-bearing for contrast then a pale brand colour would make
 * the accessibility widget itself unreadable.
 * @param {WidgetPosition} position - Where the trigger sits on the page.
 * @param {string} accentColour - A validated hex colour for decoration.
 * @returns {string} The complete CSS for the widget's shadow root.
 */
const getWidgetCss = (
  position: WidgetPosition,
  accentColour: string,
): string => {
  return (
    `:host { all: initial; position: fixed; ${getAnchorStyles(position)} z-index: ${WIDGET_Z_INDEX}; }` +
    '.qc-root { position: relative; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;' +
    ' font-size: 15px; line-height: 1.4; color: #111111; text-align: left; }' +
    '.qc-root, .qc-root *, .qc-root *::before, .qc-root *::after { box-sizing: border-box; }' +
    '.qc-root button { font: inherit; color: inherit; margin: 0; cursor: pointer; }' +
    '.qc-root [hidden] { display: none !important; }' +
    `.qc-trigger { display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; padding: 0;` +
    ` background: #ffffff; color: #111111; border: 2px solid ${accentColour}; border-radius: 50%;` +
    ' box-shadow: 0 2px 14px rgba(0, 0, 0, 0.22); }' +
    '.qc-trigger:hover { background: #f4f4f5; }' +
    `.qc-root :focus-visible { outline: 3px solid ${accentColour}; outline-offset: 2px; box-shadow: 0 0 0 6px #ffffff, 0 0 0 8px #111111; }` +
    `.qc-panel { position: absolute; ${getPanelAnchorStyles(position)} display: flex; flex-direction: column; gap: 18px;` +
    ' width: min(320px, calc(100vw - 32px)); max-height: min(70vh, 560px); overflow-y: auto; padding: 18px;' +
    ' background: #ffffff; border: 1px solid #d4d4d8; border-radius: 14px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.26); }' +
    '.qc-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }' +
    '.qc-title { margin: 0; font-size: 17px; font-weight: 700; }' +
    '.qc-close { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; padding: 0;' +
    ' background: transparent; border: 1px solid #d4d4d8; border-radius: 8px; }' +
    '.qc-close:hover { background: #f4f4f5; }' +
    '.qc-group { display: flex; flex-direction: column; gap: 8px; }' +
    '.qc-group-label { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #52525b; }' +
    '.qc-options { display: grid; gap: 6px; }' +
    '.qc-options-stack { grid-template-columns: 1fr; }' +
    '.qc-options-pair { grid-template-columns: 1fr 1fr; }' +
    '.qc-option { min-width: 0; min-height: 44px; padding: 8px 12px; background: #ffffff; color: #111111;' +
    ' border: 1px solid #a1a1aa; border-radius: 8px; font-size: 14px; text-align: center; }' +
    '.qc-option:hover { background: #f4f4f5; }' +
    `.qc-option[aria-pressed="true"] { background: #111111; color: #ffffff; border-color: #111111; font-weight: 600; }` +
    '.qc-toggle { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%;' +
    ' min-height: 44px; padding: 8px 12px; background: #ffffff; color: #111111; border: 1px solid #a1a1aa;' +
    ' border-radius: 8px; font-size: 14px; text-align: left; }' +
    '.qc-toggle:hover { background: #f4f4f5; }' +
    '.qc-toggle-state { flex: 0 0 auto; padding: 3px 9px; border: 1px solid currentColor; border-radius: 999px;' +
    ' font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }' +
    '.qc-toggle[aria-pressed="true"] { background: #111111; color: #ffffff; border-color: #111111; }' +
    '.qc-reset { min-height: 44px; padding: 10px 14px; background: #ffffff; color: #111111;' +
    ' border: 2px solid #111111; border-radius: 8px; font-size: 14px; font-weight: 600; }' +
    '.qc-reset:hover { background: #111111; color: #ffffff; }' +
    '.qc-foot { margin: 0; font-size: 12px; color: #52525b; }' +
    '.qc-live { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden;' +
    ' clip-path: inset(50%); white-space: nowrap; border: 0; }'
  )
}

export { getWidgetCss }
