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

const FIT_IN_OPTIONS: Record<string, string> = {
  DEFAULT: '',
  FULL: '{ full: true }',
  ADAPTIVE: '{ adaptive: true }',
  ADAPTIVE_FULL: '{ adaptive: true, full: true }'
}

function build(s: State) {
  const thumbor = createThumbor({ url: s.server, key: s.key || undefined })
  const lines: string[] = []

  let image = thumbor.image(s.image, { encode: s.encode })
  const src = s.encode ? `${quote(s.image)}, { encode: true }` : quote(s.image)

  if (s.debug) {
    image = image.debug()
    lines.push('.debug()')
  }
  if (s.meta) {
    image = image.meta()
    lines.push('.meta()')
  }
  if (s.trim) {
    const orientation = s.trimOrientation || undefined
    image = image.trim(orientation, s.trimTolerance)
    const args = s.trimTolerance !== undefined
      ? [orientation ? quote(orientation) : 'undefined', String(s.trimTolerance)]
      : orientation ? [quote(orientation)] : []
    lines.push(`.trim(${args.join(', ')})`)
  }
  if (s.manualCrop) {
    image = image.crop(s.crop)
    lines.push(`.crop({ left: ${s.crop.left}, top: ${s.crop.top}, right: ${s.crop.right}, bottom: ${s.crop.bottom} })`)
  }
  if (s.fitIn) {
    image = image.fitIn(s.width, s.height, FitInType[s.fitIn])
    const options = FIT_IN_OPTIONS[s.fitIn]
    lines.push(`.fitIn(${s.width}, ${s.height}${options ? ', ' + options : ''})`)
  } else if (s.width || s.height) {
    image = image.resize(s.width, s.height)
    lines.push(`.resize(${s.width}, ${s.height})`)
  }
  if (s.flipH || s.flipV) {
    const direction = s.flipH && s.flipV ? 'both' : s.flipH ? 'horizontal' : 'vertical'
    image = image.flip(direction)
    lines.push(`.flip('${direction}')`)
  }
  if (s.halign || s.valign) {
    const h = s.halign ? HorizontalPosition[s.halign] : undefined
    const v = s.valign ? VerticalPosition[s.valign] : undefined
    image = image.align(h, v)
    lines.push(v ? `.align(${h ? quote(h) : 'undefined'}, ${quote(v)})` : `.align(${quote(h!)})`)
  }
  if (s.smart) {
    image = image.smart()
    lines.push('.smart()')
  }
  if (s.filters.length) {
    image = image.filter(...s.filters)
    for (const f of s.filters) {
      const call = filterCode(f)
      lines.push(call.startsWith('filters.') ? call.slice('filters'.length) : `.filter(${call})`)
    }
  }

  const url = image.url()

  const options = s.key
    ? `{\n  url: ${quote(s.server)},\n  key: process.env.THUMBOR_KEY\n}`
    : `{ url: ${quote(s.server)} }`
  const code = [
    `import { createThumbor } from 'thumbor-client'`,
    '',
    `const thumbor = createThumbor(${options})`,
    '',
    'const url = thumbor',
    `  .image(${src})`,
    ...lines.map((l) => '  ' + l),
    '  .url()'
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
