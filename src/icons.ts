import type { IconName } from './types'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

interface IconShape {
  tag: 'circle' | 'path'
  attributes: Record<string, string>
}

const STROKE_ROUND: Record<string, string> = {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '1.7',
  'stroke-linecap': 'round',
}

/**
 * The universal access figure rather than the wheelchair symbol, which reads as
 * mobility-only and misdescribes who these controls are for.
 */
const ACCESSIBILITY_SHAPES: IconShape[] = [
  {
    tag: 'circle',
    attributes: {
      cx: '12',
      cy: '12',
      r: '10.25',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.6',
    },
  },
  {
    tag: 'circle',
    attributes: { cx: '12', cy: '6.5', r: '1.6', fill: 'currentColor' },
  },
  { tag: 'path', attributes: { ...STROKE_ROUND, d: 'M5.75 9.4H18.25' } },
  { tag: 'path', attributes: { ...STROKE_ROUND, d: 'M12 9.6V13.6' } },
  { tag: 'path', attributes: { ...STROKE_ROUND, d: 'M12 13.6L9.4 18.9' } },
  { tag: 'path', attributes: { ...STROKE_ROUND, d: 'M12 13.6L14.6 18.9' } },
]

const CLOSE_SHAPES: IconShape[] = [
  {
    tag: 'path',
    attributes: {
      ...STROKE_ROUND,
      'stroke-width': '2',
      d: 'M6.5 6.5L17.5 17.5',
    },
  },
  {
    tag: 'path',
    attributes: {
      ...STROKE_ROUND,
      'stroke-width': '2',
      d: 'M17.5 6.5L6.5 17.5',
    },
  },
]

const ICON_SHAPES: Record<IconName, IconShape[]> = {
  accessibility: ACCESSIBILITY_SHAPES,
  close: CLOSE_SHAPES,
}

const ICON_SIZES: Record<IconName, string> = {
  accessibility: '28',
  close: '18',
}

/**
 * Builds an icon node by node rather than assigning innerHTML, so the widget
 * still renders on host sites that enforce Trusted Types.
 * @param {IconName} name - Which icon to build.
 * @returns {SVGSVGElement} A decorative, focus-proof icon element.
 */
const createIcon = (name: IconName): SVGSVGElement => {
  const size = ICON_SIZES[name]
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg')

  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('width', size)
  svg.setAttribute('height', size)
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')

  for (const shape of ICON_SHAPES[name]) {
    const node = document.createElementNS(SVG_NAMESPACE, shape.tag)

    for (const [attributeName, attributeValue] of Object.entries(
      shape.attributes,
    )) {
      node.setAttribute(attributeName, attributeValue)
    }

    svg.appendChild(node)
  }

  return svg
}

export { createIcon }
