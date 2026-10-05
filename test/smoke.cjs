const { createThumbor, FitInType, HorizontalPosition } = require('thumbor-client')

const expected = 'https://t.example/vQ9gieafFixUca_XvzCDWc1tp_I=/adaptive-fit-in/300x200/left/a.jpg'
const url = createThumbor({ url: 'https://t.example', key: 'MY_SECURE_KEY' })
  .setPath('a.jpg')
  .fitIn(300, 200, FitInType.ADAPTIVE)
  .halign(HorizontalPosition.LEFT)
  .buildURL()

if (url !== expected) {
  console.error(`cjs: got ${url}`)
  process.exit(1)
}
console.log('cjs ok')
