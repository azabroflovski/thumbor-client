# Filters

`filters.*` returns filter calls as strings, `filter()` adds them to the url:

```ts
import { filters } from 'thumbor-client'

thumbor.setPath('cat.jpg').resize(300, 200).filter(filters.quality(80), filters.format('webp'))
// 300x200/filters:quality(80):format(webp)
```

A plain string works too, for filters without a helper or custom ones:

```ts
thumbor.setPath('cat.jpg').filter('quality(80)')
```

Thumbor ignores a filter with arguments it can't parse and still returns the image. If a filter has no effect, check the url. Arguments described as integers must be integers.

Helpers exist for every filter enabled in Thumbor 7 by default. Each one is checked against a real Thumbor server in CI.

## Output

### quality

`filters.quality(80)` → `quality(80)`. 0 to 100, for jpeg, webp and avif.

### format

`filters.format('webp')` → `format(webp)`. `webp`, `avif`, `jpeg`, `jpg`, `png`, `gif`, `heic`, `heif`.

### maxBytes

`filters.maxBytes(50000)` → `max_bytes(50000)`. Lowers the quality until the file fits. If it can't get that small, Thumbor returns the image unchanged.

### maxAge

`filters.maxAge(3600)` → `max_age(3600)`. `Cache-Control: max-age` for this image.

### stripExif, stripIcc

`filters.stripExif()` → `strip_exif()`, `filters.stripIcc()` → `strip_icc()`.

## Size

### noUpscale

`filters.noUpscale()` → `no_upscale()`. Images smaller than the requested size stay as they are.

### upscale

`filters.upscale()` → `upscale()`. With `fitIn`, enlarges small images to the box.

### stretch

`filters.stretch()` → `stretch()`. Resizes to the exact size, ignoring proportions. Works with `resize`, has no effect with `fitIn`.

### proportion

`filters.proportion(0.5)` → `proportion(0.5)`. Scales the result after all other operations.

## Crop focus

### focal

`filters.focal({ left: 100, top: 50, right: 200, bottom: 150 })` → `focal(100x50:200x150)`. The area to keep in frame when cropping, instead of smart detection.

### extractFocal

`filters.extractFocal()` → `extract_focal()`. When the source is another Thumbor url with a crop, uses that crop as the focal area.

## Background

### fill

`filters.fill('white')` → `fill(white)`. Color for the empty area left by `fitIn`. A color name, hex without `#` (`ff0000`), `transparent`, `auto` (detected from the image) or `blur` (blurred copy of the image).

`filters.fill('transparent', true)` → `fill(transparent,true)` also fills transparent pixels of the image.

### backgroundColor

`filters.backgroundColor('ffffff')` → `background_color(ffffff)`. Fills transparent areas, for example when converting png to jpeg.

## Color

### brightness, contrast

`filters.brightness(20)` → `brightness(20)`, `filters.contrast(-10)` → `contrast(-10)`. Integers, -100 to 100.

### saturation

`filters.saturation(1.5)` → `saturation(1.5)`. 1 keeps the image as is, 0 is grayscale.

### rgb

`filters.rgb(20, 0, -20)` → `rgb(20,0,-20)`. Percent per channel, integers -100 to 100.

### grayscale, equalize

`filters.grayscale()` → `grayscale()`, `filters.equalize()` → `equalize()`.

### colorize

`filters.colorize(100, 0, 0, 'ff0000')` → `colorize(100,0,0,ff0000)`. Percent of each channel to mix with the fill color.

## Effects

### blur

`filters.blur(5)` → `blur(5)`, `filters.blur(5, 2)` → `blur(5,2)`. Radius is an integer above 0, sigma defaults to the radius.

### sharpen

`filters.sharpen(2, 1, true)` → `sharpen(2,1,true)`. Amount, radius, luminance only.

### noise

`filters.noise(40)` → `noise(40)`. 0 to 100, optional seed as the second argument.

### rotate

`filters.rotate(90)` → `rotate(90)`. Degrees, Thumbor rounds to a multiple of 90.

### roundCorner

`filters.roundCorner(20)` → `round_corner(20,255,255,255)`. The corner color defaults to white.

`filters.roundCorner([40, 20], [0, 0, 0], true)` → `round_corner(40|20,0,0,0,true)`. Elliptic corners, black, transparent.

### convolution

`filters.convolution([-1, -1, -1, -1, 8, -1, -1, -1, -1], 3)` → `convolution(-1;-1;-1;-1;8;-1;-1;-1;-1,3,true)`. Matrix, number of columns, normalize.

## Overlays

### watermark

`filters.watermark('https://example.com/logo.png', -10, -10, 50)` → `watermark(https://example.com/logo.png,-10,-10,50)`.

Arguments: image url, x, y, transparency 0 to 100. Positions are pixels from the left/top, negative from the right/bottom, percent (`'20p'`), `'center'` or `'repeat'`.

Optional width and height ratios limit the watermark size in percent of the image:

`filters.watermark('logo.png', 'center', 'center', 0, 30)` → `watermark(logo.png,center,center,0,30)`

### frame

`filters.frame('frame.png')` → `frame(frame.png)`. Nine-patch image around the result.

## Not covered

`curve`, `redeye`, `autojpg` have no helpers: `curve` takes nested lists, the other two are not enabled by default. Use a string: `filter('curve([(0,0),(255,255)],[],[],[])')`.
