// Runs the IIFE build in an empty context: no require, no process, no crypto. Same as a <script> tag.
const fs = require('node:fs')
const vm = require('node:vm')

const ctx = vm.createContext({})
vm.runInContext(fs.readFileSync(__dirname + '/../dist/thumbor-client.iife.js', 'utf8'), ctx)
const url = vm.runInContext(`
  ThumborClient.createThumbor({ url: 'https://t.example', key: 'MY_SECURE_KEY' })
    .setPath('a.jpg')
    .fitIn(300, 200, ThumborClient.FitInType.ADAPTIVE)
    .halign(ThumborClient.HorizontalPosition.LEFT)
    .buildURL()
`, ctx)

if (url !== 'https://t.example/vQ9gieafFixUca_XvzCDWc1tp_I=/adaptive-fit-in/300x200/left/a.jpg') {
  console.error(`iife: got ${url}`)
  process.exit(1)
}
console.log('iife ok')
