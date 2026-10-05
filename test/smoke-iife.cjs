// Runs the browser builds in an empty context: no require, no process, no crypto. Same as a <script> tag.
// thumbor-client.umd.cjs is kept for links from 0.1.0 and earlier.
const fs = require('node:fs')
const vm = require('node:vm')

const expected = 'https://t.example/vQ9gieafFixUca_XvzCDWc1tp_I=/adaptive-fit-in/300x200/left/a.jpg'

for (const file of ['thumbor-client.iife.js', 'thumbor-client.umd.cjs']) {
  const ctx = vm.createContext({})
  vm.runInContext(fs.readFileSync(`${__dirname}/../dist/${file}`, 'utf8'), ctx)
  const url = vm.runInContext(`
    ThumborClient.createThumbor({ url: 'https://t.example', key: 'MY_SECURE_KEY' })
      .setPath('a.jpg')
      .fitIn(300, 200, ThumborClient.FitInType.ADAPTIVE)
      .halign(ThumborClient.HorizontalPosition.LEFT)
      .buildURL()
  `, ctx)

  const imageUrl = vm.runInContext(`
    ThumborClient.createThumbor({ url: 'https://t.example', key: 'MY_SECURE_KEY' })
      .image('a.jpg').fitIn(300, 200, { adaptive: true }).align('left').url()
  `, ctx)

  if (url !== expected || imageUrl !== expected) {
    console.error(`${file}: got ${url}`)
    process.exit(1)
  }
  console.log(`${file} ok`)
}
