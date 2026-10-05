# Resize and crop

## resize

```ts
thumbor.setPath('cat.jpg').resize(300, 200)   // 300x200
thumbor.setPath('cat.jpg').resize(300, 0)     // 300x0, height keeps proportions
thumbor.setPath('cat.jpg').resize('orig', 200) // origx200, original width
```

When the proportions differ from the image, Thumbor crops to fill the box. Which part is kept depends on [alignment](#alignment) and [smart crop](#smart-crop).

::: warning
Thumbor 7 returns 500 for `'orig'` combined with `0`, e.g. `resize('orig', 0)`. It's a server bug, use a number instead of `0`.
:::

## fitIn

Fits the image into the box without cropping.

```ts
import { FitInType } from 'thumbor-client'

thumbor.setPath('cat.jpg').fitIn(800, 600)                          // fit-in/800x600
thumbor.setPath('cat.jpg').fitIn(800, 600, FitInType.FULL)          // full-fit-in/800x600
thumbor.setPath('cat.jpg').fitIn(800, 600, FitInType.ADAPTIVE)      // adaptive-fit-in/800x600
thumbor.setPath('cat.jpg').fitIn(800, 600, FitInType.ADAPTIVE_FULL) // adaptive-full-fit-in/800x600
```

| Type | Behaviour |
|---|---|
| `DEFAULT` | the whole image fits inside the box |
| `FULL` | the smaller side fills the box, the other side may be bigger |
| `ADAPTIVE` | like `DEFAULT`, but swaps width and height if that fits a portrait/landscape image better |
| `ADAPTIVE_FULL` | `ADAPTIVE` and `FULL` together |

`fitIn` and `resize` set the same size, the last call wins.

To fill the empty area use the [`fill`](/guide/filters#fill) filter.

## flip

```ts
thumbor.setPath('cat.jpg').resize(300, 200).flipHorizontally().flipVertically()
// -300x-200
```

## crop

Manual crop in pixels of the original image, applied before resizing:

```ts
thumbor.setPath('cat.jpg').crop({ left: 10, top: 20, right: 410, bottom: 320 }).resize(200, 150)
// 10x20:410x320/200x150
```

## Alignment

Which part to keep when `resize` has to crop:

```ts
import { HorizontalPosition, VerticalPosition } from 'thumbor-client'

thumbor.setPath('cat.jpg').resize(300, 300).halign(HorizontalPosition.LEFT).valign(VerticalPosition.TOP)
// 300x300/left/top
```

Defaults are center and middle.

## Smart crop

Thumbor detects faces and features and keeps them in frame. Needs detectors enabled on the server.

```ts
thumbor.setPath('cat.jpg').resize(300, 300).smartCrop()
// 300x300/smart
```

To set the focus point yourself, use the [`focal`](/guide/filters#focal) filter.

## trim

Removes the border of the same color around the image.

```ts
thumbor.setPath('cat.jpg').trim()                    // trim
thumbor.setPath('cat.jpg').trim('bottom-right', 10)  // trim:bottom-right:10
```

The first argument is the pixel used as the border color, `top-left` by default. The second is the color tolerance, 0 to 442.
