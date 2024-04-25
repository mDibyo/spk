# spk

spk is a simple Chrome extension that enables voice typing in any textarea. It uses the Chrome Speech Recognition API, with OpenAI GPT 3.5-Turbo and GPT 4.0 for punctuation, capitalization, and proper noun-correction support.

## Concept

The spk extension is active as soon as any webpage is loaded:

- It starts by scanning the document for proper nouns - these are used to seed speech recognition since the user is more likely than not to be referring to items on the page.
- When the user enters an textarea, they immediately get the option to "spk" rather than type. After selecting, the user can start dictating what they want to type.
- "spk" first uses Chrome's Speech Recognition API for the initial speech-to-text and then improves/corrects it using an LLM chain.
- "spk" is able to learn from errors - "spk" remembers any edits that the user made to the voice dictation output, and takes those into consideration in future.

## Development

### Install dependencies

This project requires node (v18+). If your system node version is not up-to-date, consider using a version manager like [NVM](https://github.com/nvm-sh/nvm) to install and manage node versions.

```shell
npm install
```

### Open an example webpage

Open an example webpage for the extension to work on. You can specify the example with the `EXAMPLE` environment variable.

```shell
EXAMPLE=best_food npm run start-example
```

If the `EXAMPLE` environment variable is not defined, the "default" example will be started.

### Build Chrome extension and load into browser

In a separate terminal, run

```shell
npm start
```

This will create an unpacked version of the extension in a `dist` folder. Load the unpacked extension in Chrome following instructions [here](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

## Release

When the time is right, the Chrome extension can be released by building a packaged extension (with `npm build`) and then uploading to the Chrome App store.
