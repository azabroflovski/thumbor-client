import { createThumbor, FitInType, HorizontalPosition, VerticalPosition } from '../src/main.ts'

const form = document.querySelector<HTMLFormElement>('#form')!
const urlEl = document.querySelector<HTMLElement>('#url')!
const codeEl = document.querySelector<HTMLElement>('#code')!
const img = document.querySelector<HTMLImageElement>('#img')!
const imgError = document.querySelector<HTMLElement>('#img-error')!

const STORAGE_KEY = 'thumbor-client-demo'

function read() {
  const data = new FormData(form)
  const str = (name: string) => String(data.get(name) ?? '').trim()
  const num = (name: string) => Math.max(0, Number(data.get(name)) || 0)
  const bool = (name: string) => data.get(name) === 'on'

  return {
    server: str('server'),
    key: str('key'),
    image: str('image'),
    width: num('width'),
    height: num('height'),
    fitIn: str('fitIn') as keyof typeof FitInType | '',
    flipH: bool('flipH'),
    flipV: bool('flipV'),
    smart: bool('smart'),
    trim: bool('trim'),
    halign: str('halign') as keyof typeof HorizontalPosition | '',
    valign: str('valign') as keyof typeof VerticalPosition | '',
    manualCrop: bool('manualCrop'),
    crop: { left: num('cropLeft'), top: num('cropTop'), right: num('cropRight'), bottom: num('cropBottom') },
    filters: str('filters').split('\n').map((f) => f.trim()).filter(Boolean)
  }
}

type State = ReturnType<typeof read>

const quote = (str: string) => `'${str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

function build(s: State) {
  const thumbor = createThumbor({ url: s.server, key: s.key || undefined })
  const lines: string[] = []
  const isUrl = /^https?:\/\//.test(s.image)

  if (isUrl) {
    thumbor.fromUrl(s.image)
    lines.push(`.fromUrl(${quote(s.image)})`)
  } else {
    thumbor.setPath(s.image)
    lines.push(`.setPath(${quote(s.image)})`)
  }

  if (s.trim) {
    thumbor.trim()
    lines.push('.trim()')
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
  for (const f of s.filters) {
    thumbor.filter(f)
    lines.push(`.filter(${quote(f)})`)
  }

  const url = thumbor.buildURL()

  const enums = [s.fitIn && 'FitInType', s.halign && 'HorizontalPosition', s.valign && 'VerticalPosition'].filter(Boolean)
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
  for (const name of ['cropLeft', 'cropTop', 'cropRight', 'cropBottom']) {
    (form.elements.namedItem(name) as HTMLInputElement).disabled = !(form.elements.namedItem('manualCrop') as HTMLInputElement).checked
  }

  const state = read()
  const { url, code } = build(state)
  urlEl.textContent = url
  codeEl.textContent = code

  if (img.getAttribute('src') !== url) {
    imgError.hidden = true
    img.hidden = false
    img.src = url
  }

  try {
    // the key is not saved
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...Object.fromEntries(new FormData(form)), key: '' }))
  } catch {}
}

function restore() {
  let saved: Record<string, string> | null = null
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {}
  if (!saved) return

  for (const el of Array.from(form.elements) as HTMLInputElement[]) {
    if (!el.name || el.name === 'key') continue
    if (el.type === 'checkbox') el.checked = saved[el.name] === 'on'
    else if (el.name in saved) el.value = saved[el.name]
  }
}

img.addEventListener('error', () => {
  img.hidden = true
  imgError.hidden = false
})

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy!)!
    await navigator.clipboard.writeText(target.textContent ?? '')
    button.textContent = 'Copied'
    setTimeout(() => (button.textContent = 'Copy'), 1200)
  })
}

form.addEventListener('input', render)
form.addEventListener('submit', (e) => e.preventDefault())
restore()
render()
