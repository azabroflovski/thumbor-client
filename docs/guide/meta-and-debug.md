# Meta and debug

## meta

Thumbor returns JSON instead of the image: source size, operations, target size, focal points.

```ts
thumbor.image('cat.jpg').resize(300, 200).meta().url()
// https://thumbor.example.com/unsafe/meta/300x200/cat.jpg
```

```json
{
  "thumbor": {
    "source": { "url": "...", "width": 800, "height": 533, "frameCount": 1 },
    "operations": [{ "type": "resize", "width": 300.0, "height": 200.0 }],
    "target": { "width": 300.0, "height": 200.0 },
    "focal_points": [{ "x": 400, "y": 266, "z": 1.0, "height": 1, "width": 1, "origin": "alignment" }]
  }
}
```

Filters are not listed in the response.

To fetch it from a browser on another origin, the server needs `ACCESS_CONTROL_ALLOW_ORIGIN_HEADER = '*'` (or your origin) in `thumbor.conf`.

## debug

Thumbor draws the detected focal points on the image. Useful to see why smart crop picked an area.

```ts
thumbor.image('cat.jpg').resize(300, 200).smart().debug().url()
// https://thumbor.example.com/unsafe/debug/300x200/smart/cat.jpg
```

Both take a boolean, `meta(false)` and `debug(false)` turn them off again.
