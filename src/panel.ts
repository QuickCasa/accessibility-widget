import {
  CONTRAST_OPTIONS,
  LABELS,
  PANEL_HOST_ID,
  TEXT_SCALE_OPTIONS,
  TOGGLE_DEFINITIONS,
} from './constants'
import { createIcon } from './icons'
import { adoptShadowCss } from './shadow-styles'
import { getWidgetCss } from './widget-styles'
import type {
  AccessibilityApi,
  AccessibilityConfig,
  FeatureKey,
  PanelController,
} from './types'

const PANEL_BODY_ID = 'qc-a11y-panel-body'
const PANEL_TITLE_ID = 'qc-a11y-panel-title'

const createOptionButton = (
  label: string,
  onSelect: () => void,
): HTMLButtonElement => {
  const button = document.createElement('button')

  button.type = 'button'
  button.className = 'qc-option'
  button.textContent = label
  button.setAttribute('aria-pressed', 'false')
  button.addEventListener('click', onSelect)

  return button
}

const createGroupShell = (
  groupLabel: string,
  layoutClass: string,
): { group: HTMLDivElement; options: HTMLDivElement } => {
  const group = document.createElement('div')
  group.className = 'qc-group'

  const label = document.createElement('div')
  label.className = 'qc-group-label'
  label.textContent = groupLabel

  const options = document.createElement('div')
  options.className = `qc-options ${layoutClass}`
  options.setAttribute('role', 'group')
  options.setAttribute('aria-label', groupLabel)

  group.appendChild(label)
  group.appendChild(options)

  return { group, options }
}

/**
 * Builds the accessibility panel and its trigger inside an open shadow root.
 *
 * The shadow root is open rather than closed so that automated auditing tools
 * and the host site's own testing can inspect the widget. An accessibility
 * control that cannot itself be audited is not worth shipping.
 * @param {AccessibilityConfig} config - The resolved plugin configuration.
 * @param {PanelController} controller - Preference reader and writer.
 * @returns {AccessibilityApi | null} The public API, or null if already present.
 */
const createAccessibilityPanel = (
  config: AccessibilityConfig,
  controller: PanelController,
): AccessibilityApi | null => {
  if (document.getElementById(PANEL_HOST_ID)) {
    return null
  }

  const isFeatureEnabled = (feature: FeatureKey): boolean =>
    config.features.includes(feature)

  const host = document.createElement('div')
  host.id = PANEL_HOST_ID
  const shadow = host.attachShadow({ mode: 'open' })

  adoptShadowCss(shadow, getWidgetCss(config.position, config.accentColour))

  const root = document.createElement('div')
  root.className = 'qc-root'

  const liveRegion = document.createElement('div')
  liveRegion.className = 'qc-live'
  liveRegion.setAttribute('role', 'status')
  liveRegion.setAttribute('aria-live', 'polite')

  const announce = (message: string): void => {
    liveRegion.textContent = message
  }

  const trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.className = 'qc-trigger'
  trigger.setAttribute('aria-expanded', 'false')
  trigger.setAttribute('aria-controls', PANEL_BODY_ID)
  trigger.setAttribute('aria-label', config.triggerLabel)
  trigger.appendChild(createIcon('accessibility'))

  const panel = document.createElement('div')
  panel.className = 'qc-panel'
  panel.id = PANEL_BODY_ID
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-labelledby', PANEL_TITLE_ID)
  panel.setAttribute('tabindex', '-1')
  panel.hidden = true

  const header = document.createElement('div')
  header.className = 'qc-head'

  const title = document.createElement('h2')
  title.className = 'qc-title'
  title.id = PANEL_TITLE_ID
  title.textContent = LABELS.panelTitle

  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'qc-close'
  closeButton.setAttribute('aria-label', LABELS.closePanel)
  closeButton.appendChild(createIcon('close'))

  header.appendChild(title)
  header.appendChild(closeButton)
  panel.appendChild(header)

  const syncCallbacks: Array<() => void> = []

  const syncAll = (): void => {
    for (const callback of syncCallbacks) {
      callback()
    }
  }

  if (isFeatureEnabled('contrast')) {
    const { group, options } = createGroupShell(
      LABELS.contrastGroup,
      'qc-options-stack',
    )

    for (const option of CONTRAST_OPTIONS) {
      const button = createOptionButton(option.label, () => {
        controller.update({ contrast: option.value })
        syncAll()
        announce(`${LABELS.contrastGroup}: ${option.label}`)
      })

      syncCallbacks.push(() => {
        const isActive = controller.getPreferences().contrast === option.value
        button.setAttribute('aria-pressed', String(isActive))
      })

      options.appendChild(button)
    }

    panel.appendChild(group)
  }

  if (isFeatureEnabled('text-size')) {
    const { group, options } = createGroupShell(
      LABELS.textSizeGroup,
      'qc-options-pair',
    )

    for (const option of TEXT_SCALE_OPTIONS) {
      const button = createOptionButton(option.label, () => {
        controller.update({ textScale: option.value })
        syncAll()
        announce(`${LABELS.textSizeGroup}: ${option.label}`)
      })

      syncCallbacks.push(() => {
        const isActive = controller.getPreferences().textScale === option.value
        button.setAttribute('aria-pressed', String(isActive))
      })

      options.appendChild(button)
    }

    panel.appendChild(group)
  }

  for (const definition of TOGGLE_DEFINITIONS) {
    if (!isFeatureEnabled(definition.feature)) {
      continue
    }

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'qc-toggle'
    button.setAttribute('aria-pressed', 'false')

    const label = document.createElement('span')
    label.textContent = definition.label

    const stateBadge = document.createElement('span')
    stateBadge.className = 'qc-toggle-state'
    stateBadge.setAttribute('aria-hidden', 'true')

    button.appendChild(label)
    button.appendChild(stateBadge)

    button.addEventListener('click', () => {
      const isOn = !controller.getPreferences()[definition.key]
      controller.update({ [definition.key]: isOn })
      syncAll()
      announce(`${definition.label}: ${isOn ? LABELS.onWord : LABELS.offWord}`)
    })

    syncCallbacks.push(() => {
      const isOn = controller.getPreferences()[definition.key]
      button.setAttribute('aria-pressed', String(isOn))
      stateBadge.textContent = isOn ? LABELS.onWord : LABELS.offWord
    })

    panel.appendChild(button)
  }

  const resetButton = document.createElement('button')
  resetButton.type = 'button'
  resetButton.className = 'qc-reset'
  resetButton.textContent = LABELS.reset
  resetButton.addEventListener('click', () => {
    controller.reset()
    syncAll()
    announce(LABELS.resetAnnouncement)
  })
  panel.appendChild(resetButton)

  const footnote = document.createElement('p')
  footnote.className = 'qc-foot'
  footnote.textContent = LABELS.footnote
  panel.appendChild(footnote)

  let isOpen = false

  const open = (): void => {
    if (isOpen) {
      return
    }

    isOpen = true
    panel.hidden = false
    trigger.setAttribute('aria-expanded', 'true')
    panel.focus()
  }

  const close = (shouldRestoreFocus = true): void => {
    if (!isOpen) {
      return
    }

    isOpen = false
    panel.hidden = true
    trigger.setAttribute('aria-expanded', 'false')

    if (shouldRestoreFocus) {
      trigger.focus()
    }
  }

  trigger.addEventListener('click', () => {
    if (isOpen) {
      close()
      return
    }

    open()
  })

  closeButton.addEventListener('click', () => {
    close()
  })

  const getFocusableElements = (): HTMLElement[] =>
    Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled])'))

  root.addEventListener('keydown', (keyEvent: KeyboardEvent) => {
    if (!isOpen) {
      return
    }

    if (keyEvent.key === 'Escape') {
      keyEvent.preventDefault()
      close()
      return
    }

    if (keyEvent.key !== 'Tab') {
      return
    }

    const focusable = getFocusableElements()

    if (focusable.length === 0) {
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = shadow.activeElement

    if (keyEvent.shiftKey && (active === first || active === panel)) {
      keyEvent.preventDefault()
      last.focus()
      return
    }

    if (!keyEvent.shiftKey && active === last) {
      keyEvent.preventDefault()
      first.focus()
    }
  })

  document.addEventListener('pointerdown', (pointerEvent: Event) => {
    if (!isOpen) {
      return
    }

    if (pointerEvent.composedPath().includes(host)) {
      return
    }

    close(false)
  })

  root.appendChild(trigger)
  root.appendChild(panel)
  root.appendChild(liveRegion)
  shadow.appendChild(root)
  document.body.appendChild(host)

  syncAll()

  return {
    open,
    close: () => {
      close()
    },
    reset: () => {
      controller.reset()
      syncAll()
      announce(LABELS.resetAnnouncement)
    },
    getPreferences: controller.getPreferences,
  }
}

export { createAccessibilityPanel }
