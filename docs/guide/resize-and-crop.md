# Resize and crop

## resize

```ts
thumbor.image('cat.jpg').resize(300, 200)    // 300x200
thumbor.image('cat.jpg').resize(300, 0)      // 300x0, height keeps proportions
thumbor.image('cat.jpg').resize('orig', 200) // origx200, original width
```

When the proportions differ from the image, Thumbor crops to fill the box. Which part is kept depends on [alignment](#align) and [smart crop](#smart).

::: warning
Thumbor 7 returns 500 for `'orig'` combined with `0`, e.g. `resize('orig', 0)`. It's a server bug, use a number instead of `0`.
:::

## fitIn

Fits the image into the box without cropping.

```ts
thumbor.image('cat.jpg').fitIn(800, 600)                                  // fit-in/800x600
thumbor.image('cat.jpg').fitIn(800, 600, { full: true })                  // full-fit-in/800x600
thumbor.image('cat.jpg').fitIn(800, 600, { adaptive: true })              // adaptive-fit-in/800x600
thumbor.image('cat.jpg').fitIn(800, 600, { adaptive: true, full: true })  // adaptive-full-fit-in/800x600
```

| Option | Behaviour |
|---|---|
| none | the whole image fits inside the box |
| `full` | the smaller side fills the box, the other side may be bigger |
| `adaptive` | swaps width and height if that fits a portrait or landscape image better |

`fitIn` and `resize` replace each other, the last call wins.

To fill the empty area use the [`fill`](/guide/filters#fill) filter.

## flip

```ts
thumbor.image('cat.jpg').resize(300, 200).flip('horizontal') // -300x200
thumbor.image('cat.jpg').resize(300, 200).flip('vertical')   // 300x-200
thumbor.image('cat.jpg').resize(300, 200).flip('both')       // -300x-200
```

## crop

Manual crop in pixels of the original image, applied before resizing:

```ts
thumbor.image('cat.jpg').crop({ left: 10, top: 20, right: 410, bottom: 320 }).resize(200, 150)
// 10x20:410x320/200x150
```

## align

Which part to keep when `resize` has to crop:

```ts
thumbor.image('cat.jpg').resize(300, 300).align('left', 'top')
// 300x300/left/top
```

Horizontal: `left`, `center`, `right`. Vertical: `top`, `middle`, `bottom`. Thumbor defaults to center and middle. For vertical only: `align(undefined, 'top')`.

## smart

Thumbor detects faces and features and keeps them in frame. Needs detectors enabled on the server.

```ts
thumbor.image('cat.jpg').resize(300, 300).smart()
// 300x300/smart
```

To set the focus area yourself, use the [`focal`](/guide/filters#focal) filter.

## trim

Removes the border of the same color around the image.

```ts
thumbor.image('cat.jpg').trim()                    // trim
thumbor.image('cat.jpg').trim('bottom-right', 10)  // trim:bottom-right:10
```

The first argument is the pixel used as the border color, `top-left` by default. The second is the color tolerance, 0 to 442.
