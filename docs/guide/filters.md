# Filters

Every filter is a method on the image:

```ts
thumbor.image('cat.jpg').resize(300, 200).quality(80).format('webp').url()
// https://thumbor.example.com/unsafe/300x200/filters:quality(80):format(webp)/cat.jpg
```

The same calls exist as functions in `filters`, they return the filter string. Use them to keep a list of filters in a variable, or pass a plain string for filters without a helper:

```ts
import { filters } from 'thumbor-client'

const web = [filters.quality(80), filters.format('webp')]

thumbor.image('cat.jpg').filter(...web)
thumbor.image('cat.jpg').filter('curve([(0,0),(255,255)],[],[],[])')
```

Filters are applied in the order they are added.

Thumbor ignores a filter with arguments it can't parse and still returns the image. If a filter has no effect, check the url. Arguments described as integers must be integers.

There is a method for every filter enabled in Thumbor 7 by default. Each one is checked against a real Thumbor server in CI.

Below, `.name(args)` is the method, the result is the filter in the url.

## Output

### quality

`.quality(80)` → `quality(80)`. 0 to 100, for jpeg, webp and avif.

### format

`.format('webp')` → `format(webp)`. `webp`, `avif`, `jpeg`, `jpg`, `png`, `gif`, `heic`, `heif`.

### maxBytes

`.maxBytes(50000)` → `max_bytes(50000)`. Lowers the quality until the file fits. If it can't get that small, Thumbor returns the image unchanged.

### maxAge

`.maxAge(3600)` → `max_age(3600)`. `Cache-Control: max-age` for this image.

### stripExif, stripIcc

`.stripExif()` → `strip_exif()`, `.stripIcc()` → `strip_icc()`.

## Size

### noUpscale

`.noUpscale()` → `no_upscale()`. Images smaller than the requested size stay as they are.

### upscale

`.upscale()` → `upscale()`. With `fitIn`, enlarges small images to the box.

### stretch

`.stretch()` → `stretch()`. Resizes to the exact size, ignoring proportions. Works with `resize`, has no effect with `fitIn`.

### proportion

`.proportion(0.5)` → `proportion(0.5)`. Scales the result after all other operations.

## Crop focus

### focal

`.focal({ left: 100, top: 50, right: 200, bottom: 150 })` → `focal(100x50:200x150)`. The area to keep in frame when cropping, instead of smart detection.

### extractFocal

`.extractFocal()` → `extract_focal()`. When the source is another Thumbor url with a crop, uses that crop as the focal area.

## Background

### fill

`.fill('white')` → `fill(white)`. Color for the empty area left by `fitIn`. A color name, hex without `#` (`ff0000`), `transparent`, `auto` (detected from the image) or `blur` (blurred copy of the image).

`.fill('transparent', true)` → `fill(transparent,true)` also fills transparent pixels of the image.

### backgroundColor

`.backgroundColor('ffffff')` → `background_color(ffffff)`. Fills transparent areas, for example when converting png to jpeg.

## Color

### brightness, contrast

`.brightness(20)` → `brightness(20)`, `.contrast(-10)` → `contrast(-10)`. Integers, -100 to 100.

### saturation

`.saturation(1.5)` → `saturation(1.5)`. 1 keeps the image as is, 0 is grayscale.

### rgb

`.rgb(20, 0, -20)` → `rgb(20,0,-20)`. Percent per channel, integers -100 to 100.

### grayscale, equalize

`.grayscale()` → `grayscale()`, `.equalize()` → `equalize()`.

### colorize

`.colorize(100, 0, 0, 'ff0000')` → `colorize(100,0,0,ff0000)`. Percent of each channel to mix with the fill color.

## Effects

### blur

`.blur(5)` → `blur(5)`, `.blur(5, 2)` → `blur(5,2)`. Radius is an integer above 0, sigma defaults to the radius.

### sharpen

`.sharpen(2, 1, true)` → `sharpen(2,1,true)`. Amount, radius, luminance only.

### noise

`.noise(40)` → `noise(40)`. 0 to 100, optional seed as the second argument.

### rotate

`.rotate(90)` → `rotate(90)`. Degrees, Thumbor rounds to a multiple of 90.

### roundCorner

`.roundCorner(20)` → `round_corner(20,255,255,255)`. The corner color defaults to white.

`.roundCorner([40, 20], [0, 0, 0], true)` → `round_corner(40|20,0,0,0,true)`. Elliptic corners, black, transparent.

### convolution

`.convolution([-1, -1, -1, -1, 8, -1, -1, -1, -1], 3)` → `convolution(-1;-1;-1;-1;8;-1;-1;-1;-1,3,true)`. Matrix, number of columns, normalize.

## Overlays

### watermark

`.watermark('https://example.com/logo.png', -10, -10, 50)` → `watermark(https://example.com/logo.png,-10,-10,50)`.

Arguments: image url, x, y, transparency 0 to 100. Positions are pixels from the left/top, negative from the right/bottom, percent (`'20p'`), `'center'` or `'repeat'`.

Optional width and height ratios limit the watermark size in percent of the image:

`.watermark('logo.png', 'center', 'center', 0, 30)` → `watermark(logo.png,center,center,0,30)`

### frame

`.frame('frame.png')` → `frame(frame.png)`. Nine-patch image around the result.

## Not covered

`curve`, `redeye`, `autojpg` have no helpers: `curve` takes nested lists, the other two are not enabled by default. Pass a string: `.filter('curve([(0,0),(255,255)],[],[],[])')`.
