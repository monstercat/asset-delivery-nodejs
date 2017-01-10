# Asset Delivery

The project was built to aid serving files with utilities. Main case being
serving thumbnails of images. Other future capabilities may including: flipping
images, streaming audio formats, etc.

## Starting

Use the following environment variables:

| Variable   | Default | Description             |
|------------|---------|-------------------------|
| PORT       | 8080    | Network port to use.    |
| DIR        | bin     | The asset directory to serve. |
| CACHE      | cache   | The image cache directory. |
| FORCE_PASS |         | The force password.     |

## Supported Features

Features are used by adding a query string parameter to the end of the request url. Such as `/my-file.jpg?image_width=128`.

### `force`

Force the utility to execute even if there is a cached version read.

### `image_width`

This allows you to request images of the width desired. We support sizes from
2px to 4096px in the power of 2 (2, 4, 8, 16, ..., 4096).


