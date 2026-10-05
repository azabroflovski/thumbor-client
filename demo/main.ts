import { createThumbor, FitInType, HorizontalPosition, VerticalPosition, type TrimOrientation } from '../src/main.ts'

const form = document.querySelector<HTMLFormElement>('#form')!
const urlEl = document.querySelector<HTMLElement>('#url')!
const codeEl = document.querySelector<HTMLElement>('#code')!
const img = document.querySelector<HTMLImageElement>('#img')!
const json = document.querySelector<HTMLElement>('#json')!
const previewError = document.querySelector<HTMLElement>('#img-error')!
const addFilter = document.querySelector<HTMLSelectElement>('#add-filter')!

function read() {
  const data = new FormData(form)
  const str = (name: string) => String(data.get(name) ?? '').trim()
  const num = (name: string) => Math.max(0, Number(data.get(name)) || 0)
  const bool = (name: string) => data.get(name) === 'on'

  return {
    server: str('server'),
    key: str('key'),
    image: str('image'),
    encode: bool('encode'),
    width: num('width'),
    height: num('height'),
    fitIn: str('fitIn') as keyof typeof FitInType | '',
    flipH: bool('flipH'),
    flipV: bool('flipV'),
    smart: bool('smart'),
    trim: bool('trim'),
    trimOrientation: str('trimOrientation') as TrimOrientation | '',
    trimTolerance: str('trimTolerance') === '' ? undefined : num('trimTolerance'),
    meta: bool('meta'),
    debug: bool('debug'),
    halign: str('halign') as keyof typeof HorizontalPosition | '',
    valign: str('valign') as keyof typeof VerticalPosition | '',
    manualCrop: bool('manualCrop'),
    crop: { left: num('cropLeft'), top: num('cropTop'), right: num('cropRight'), bottom: num('cropBottom') },
    filters: str('filters').split('\n').map((f) => f.trim()).filter(Boolean)
  }
}

type State = ReturnType<typeof read>

const quote = (str: string) => `'${str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

// filters whose helper takes the same positional arguments as the thumbor call
const SIMPLE_FILTERS: Record<string, string> = {
  quality: 'quality', format: 'format', blur: 'blur', brightness: 'brightness', contrast: 'contrast',
  saturation: 'saturation', rgb: 'rgb', grayscale: 'grayscale', equalize: 'equalize', noise: 'noise',
  sharpen: 'sharpen', rotate: 'rotate', fill: 'fill', background_color: 'backgroundColor', colorize: 'colorize',
  extract_focal: 'extractFocal', no_upscale: 'noUpscale', upscale: 'upscale', stretch: 'stretch',
  proportion: 'proportion', strip_exif: 'stripExif', strip_icc: 'stripIcc', max_bytes: 'maxBytes',
  max_age: 'maxAge', frame: 'frame'
}

/** 'quality(80)' -> 'filters.quality(80)'; calls without a simple helper stay strings */
function filterCode(call: string) {
  const m = call.match(/^(\w+)\((.*)\)$/)
  const helper = m && SIMPLE_FILTERS[m[1]]
  if (!m || !helper) return quote(call)
  const args = m[2] === '' ? [] : m[2].split(',')
  const literal = (a: string) => (/^-?\d+(\.\d+)?$/.test(a) || a === 'true' || a === 'false' ? a : quote(a))
  return `filters.${helper}(${args.map(literal).join(', ')})`
}

function build(s: State) {
  const thumbor = createThumbor({ url: s.server, key: s.key || undefined })
  const lines: string[] = []
  const isUrl = /^https?:\/\//.test(s.image)

  if (isUrl) {
    thumbor.fromUrl(s.image, { encode: s.encode })
    lines.push(s.encode ? `.fromUrl(${quote(s.image)}, { encode: true })` : `.fromUrl(${quote(s.image)})`)
  } else {
    thumbor.setPath(s.image)
    lines.push(`.setPath(${quote(s.image)})`)
  }

  if (s.debug) {
    thumbor.debug()
    lines.push('.debug()')
  }
  if (s.meta) {
    thumbor.meta()
    lines.push('.meta()')
  }
  if (s.trim) {
    const orientation = s.trimOrientation || undefined
    thumbor.trim(orientation, s.trimTolerance)
    const args = s.trimTolerance !== undefined
      ? [orientation ? quote(orientation) : 'undefined', String(s.trimTolerance)]
      : orientation ? [quote(orientation)] : []
    lines.push(`.trim(${args.join(', ')})`)
  }
  if (s.manualCrop) {
    thumbor.crop(s.crop)
    lines.push(`.crop({ left: ${s.crop.left}, top: ${s.crop.top}, right: ${s.crop.right}, bottom: ${s.crop.bottom} })`)
  }
  if (s.fitIn) {
    thumbor.fitIn(s.width, s.height, FitInType[s.fitIn])
    lines.push(`.fitIn(${s.width}, ${s.height}, FitInType.${s.fitIn})`)
  } else if (s.width || s.height) {
    thumbor.resize(s.width, s.height)
    lines.push(`.resize(${s.width}, ${s.height})`)
  }
  if (s.flipH) {
    thumbor.flipHorizontally()
    lines.push('.flipHorizontally()')
  }
  if (s.flipV) {
    thumbor.flipVertically()
    lines.push('.flipVertically()')
  }
  if (s.halign) {
    thumbor.halign(HorizontalPosition[s.halign])
    lines.push(`.halign(HorizontalPosition.${s.halign})`)
  }
  if (s.valign) {
    thumbor.valign(VerticalPosition[s.valign])
    lines.push(`.valign(VerticalPosition.${s.valign})`)
  }
  if (s.smart) {
    thumbor.smartCrop()
    lines.push('.smartCrop()')
  }
  if (s.filters.length) {
    thumbor.filter(...s.filters)
    const calls = s.filters.map(filterCode)
    lines.push(calls.length === 1 ? `.filter(${calls[0]})` : `.filter(\n    ${calls.join(',\n    ')}\n  )`)
  }

  const url = thumbor.buildURL()

  const usesHelpers = s.filters.some((f) => filterCode(f).startsWith('filters.'))
  const enums = [usesHelpers && 'filters', s.fitIn && 'FitInType', s.halign && 'HorizontalPosition', s.valign && 'VerticalPosition'].filter(Boolean)
  const options = s.key
    ? `{\n  url: ${quote(s.server)},\n  key: process.env.THUMBOR_KEY\n}`
    : `{ url: ${quote(s.server)} }`
  const code = [
    `import { ${['createThumbor', ...enums].join(', ')} } from 'thumbor-client'`,
    '',
    `const thumbor = createThumbor(${options})`,
    '',
    'const url = thumbor',
    ...lines.map((l) => '  ' + l),
    '  .buildURL()'
  ].join('\n')

  return { url, code }
}

function render() {
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement
  for (const name of ['cropLeft', 'cropTop', 'cropRight', 'cropBottom']) {
    field(name).disabled = !field('manualCrop').checked
  }
  field('trimOrientation').disabled = field('trimTolerance').disabled = !field('trim').checked

  const state = read()
  const { url, code } = build(state)
  urlEl.textContent = url
  codeEl.textContent = code

  if (url !== shown) {
    shown = url
    previewError.hidden = true
    if (state.meta) showMeta(url)
    else showImage(url)
  }

  // form state goes to the hash so a setup can be shared as a link; the key is never put there
  const params = new URLSearchParams()
  for (const [name, value] of new FormData(form)) {
    if (name !== 'key') params.append(name, String(value))
  }
  history.replaceState(null, '', '#' + params)
}

let shown = ''

function showImage(url: string) {
  json.hidden = true
  img.hidden = false
  img.src = url
}

async function showMeta(url: string) {
  img.hidden = true
  img.removeAttribute('src')
  json.hidden = false
  json.textContent = 'Loading...'
  try {
    const res = await fetch(url)
    const text = await res.text()
    if (url !== shown) return
    json.textContent = res.ok ? JSON.stringify(JSON.parse(text), null, 2) : `${res.status} ${res.statusText}`
  } catch {
    if (url !== shown) return
    json.hidden = true
    previewError.textContent = 'Request failed. To read meta from another origin the server needs ACCESS_CONTROL_ALLOW_ORIGIN_HEADER in thumbor.conf.'
    previewError.hidden = false
  }
}

function restore() {
  if (!location.hash) return
  const params = new URLSearchParams(location.hash.slice(1))

  for (const el of Array.from(form.elements) as HTMLInputElement[]) {
    if (!el.name || el.name === 'key') continue
    if (el.type === 'checkbox') el.checked = params.get(el.name) === 'on'
    else if (params.has(el.name)) el.value = params.get(el.name)!
  }
}

img.addEventListener('error', () => {
  if (!img.getAttribute('src')) return
  img.hidden = true
  previewError.textContent = 'Could not load the image from this server.'
  previewError.hidden = false
})

addFilter.addEventListener('change', () => {
  const textarea = form.elements.namedItem('filters') as HTMLTextAreaElement
  textarea.value = (textarea.value.trim() + '\n' + addFilter.value).trim()
  addFilter.value = ''
  render()
})

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy!)!
    await navigator.clipboard.writeText(target.textContent ?? '')
    button.textContent = 'Copied'
    setTimeout(() => (button.textContent = 'Copy'), 1200)
  })
}

document.querySelector('#reset')!.addEventListener('click', () => {
  form.reset()
  render()
})

form.addEventListener('input', render)
form.addEventListener('submit', (e) => e.preventDefault())
restore()
render()
