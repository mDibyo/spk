# spk

## Development

### Install

```shell
npm install
```

### Start an example document

Start an example webpage for the extension to work on. You can specify the example with the `EXAMPLE` environment variable.

```shell
EXAMPLE=best_food npm run start-example
```

If the `EXAMPLE` environment variable is not defined, the "default" example will be started.

### Build Chrome extension and load into browser

```shell
npm start
```

Load the unpacked extension in `dist` folder into Chrome.
