import { sign } from './sign.ts'
import { FitInType } from './enums.ts'
import type { ThumborParameters } from './types.ts'

const FIT_IN: Record<FitInType, string> = {
  [FitInType.DEFAULT]: 'fit-in',
  [FitInType.FULL]: 'full-fit-in',
  [FitInType.ADAPTIVE]: 'adaptive-fit-in',
  [FitInType.ADAPTIVE_FULL]: 'adaptive-full-fit-in'
}

export function defaultParameters(): ThumborParameters {
  return {
    imagePath: '',
    width: 0,
    height: 0,
    smart: false,
    trimFlag: false,
    withFlipHorizontally: false,
    withFlipVertically: false,
    filtersCalls: []
  }
}

/**
 * Operation segments in the order of Thumbor's url regex:
 * debug/meta/trim/crop/fit-in/size/halign/valign/smart/filters
 */
function segments(p: ThumborParameters) {
  const parts: string[] = []

  if (p.debug) parts.push('debug')
  if (p.meta) parts.push('meta')

  if (p.trimFlag) {
    let trim = 'trim'
    if (p.trimOrientation) trim += ':' + p.trimOrientation
    if (p.trimTolerance !== undefined) trim += ':' + p.trimTolerance
    parts.push(trim)
  }

  if (p.cropValues) {
    const { left, top, right, bottom } = p.cropValues
    parts.push(`${left}x${top}:${right}x${bottom}`)
  }

  if (p.fitInType) parts.push(FIT_IN[p.fitInType])

  if (p.width || p.height || p.withFlipHorizontally || p.withFlipVertically) {
    parts.push(`${p.withFlipHorizontally ? '-' : ''}${p.width}x${p.withFlipVertically ? '-' : ''}${p.height}`)
  }

  if (p.halignValue) parts.push(p.halignValue)
  if (p.valignValue) parts.push(p.valignValue)
  if (p.smart) parts.push('smart')
  if (p.filtersCalls.length > 0) parts.push('filters:' + p.filtersCalls.join(':'))

  return parts
}

/**
 * Full url: server, signature or `unsafe`, operations, image.
 */
export function composeUrl(server: string, key: string | undefined, p: ThumborParameters) {
  const operations = segments(p).join('/')
  const path = operations ? operations + '/' + p.imagePath : p.imagePath
  return server + '/' + (key ? sign(key, path) : 'unsafe') + '/' + path
}
