# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [3.0.0] - 2026-10-16

A big tidy-up: hardened, modernised, and made accessible. Versions 2.3 and 2.4 were never published to npm, so their changes are included here.

### Security

- All previously published versions (up to and including 2.2.5) built their output as HTML strings using `innerHTML`, which allowed cross-site scripting. Text in the page such as `&lt;img src=x onerror=…&gt;` became live markup when wrapped with `split: "word"`, a `className` containing quotes could inject attributes like `onmouseover`, and `spaceChar` was decoded using a detached element that could load images and run their event handlers. v3 builds all output with DOM methods and `textContent`, so text always stays text. **Upgrading is strongly recommended.**

### Breaking changes

- The deprecated `type` option has been removed and now throws a `TypeError`. Use `split` instead.
- An unrecognised `split` value now throws a `RangeError`, instead of quietly falling back to `"letter"`.
- `tagName` is validated before the DOM is touched, and throws a `RangeError` if invalid. `template`, `textarea`, `title`, `noscript`, `frame` and `frameset` are no longer allowed, alongside the existing void elements, `script`, `style`, `iframe`, `object` and `embed`.
- Output now includes a hidden screen reader copy of each wrapped text node, and `aria-hidden="true"` on each piece, by default. Set `accessible: false` to turn this off.
- Every created element carries a `data-wrapchars` attribute.
- When `spaceChar` is set and `wrapSpaces` is `false`, each replacement is now placed in a plain `<span data-wrapchars="space">` rather than inserted as bare text.
- Only HTML whitespace (space, tab, line feed, carriage return, form feed) is collapsed and treated as a space. Non-breaking and other Unicode spaces such as `&nbsp;` are now kept as ordinary characters, so they're wrapped like letters, keep words together in word mode, and aren't replaced by `spaceChar`. A lone tab or line break is now normalised to a space too.
- The package is now an ES module. The build files have been renamed: `dist/wrap-chars.mjs` (ES module) and `dist/wrap-chars.min.js` (classic script, adds a global `WrapChars`). The bare `https://unpkg.com/wrap-chars` URL still points at the classic script.
- Browsers without ES2022 support are no longer supported.

### Added

- `WrapChars.unwrap(element)` reverses `wrap()`.
- `separatePunctuation` option, to split punctuation from words in word mode, and `punctuationClass` to style it separately.
- `accessible` option (on by default), to keep wrapped text readable by screen readers.
- Calling `wrap()` more than once on the same element is now safe: already-wrapped content is skipped, and only new text is wrapped.
- A named export (`import { WrapChars } from 'wrap-chars'`) alongside the default export.
- Automated test suite, linting and continuous integration.

### Fixed

- Letters are split by what a reader sees (grapheme clusters), so emoji sequences, flags and combining accents are no longer broken apart. Falls back to splitting by code point in browsers without `Intl.Segmenter`.
- A bad option no longer leaves the element half-wrapped, as all options are validated first.
- Empty elements are no longer created in certain combinations of markup with `wrapSpaces` and word mode.
- `script`, `style`, `textarea`, `noscript` and `template` elements are never descended into.

## Upgrading from 2.x

1. Replace any `type` option with `split`.
2. Check any `split` values are `"letter"` or `"word"`, as anything else now throws.
3. Update script URLs or import paths to the new build file names (see [Setup](README.md#setup)). If you load `https://unpkg.com/wrap-chars` without a version, pin it to `wrap-chars@3`.
4. If your CSS or scripts select pieces with broad selectors like `span`, they'll now also match the hidden screen reader copy. Target `[data-wrapchars="piece"]` or your `className` instead, or set `accessible: false`.
5. If you rely on `&nbsp;` being treated as a regular space (e.g. replaced by `spaceChar`), replace it with a normal space in your markup.
6. If you were storing a copy of the markup just so you could restore it later, you can use `WrapChars.unwrap()` instead.

## [2.4.0] - Not published

- Hardened the ES module version: output built with DOM methods rather than HTML strings, tag names validated, `spaceChar` sanitised safely.

## [2.3.0] - Not published

- Added ES6 module versions.

## [2.2.0] - 2020-09-07

- Added `wrapSpaces` property, renamed `type` to `split`.

## [2.1.0] - 2020-09-06

- Added `deep` and `skipClass` properties, improved whitespace handling.

## [2.0.0] - 2020-08-31

- Near complete rewrite to play nicer with other people's markup.

## [1.0.1] - 2018-08-10

- Original version.

[3.0.0]: https://github.com/Adasha/wrap-chars/releases/tag/v3.0.0
[2.4.0]: https://github.com/Adasha/wrap-chars
[2.3.0]: https://github.com/Adasha/wrap-chars
[2.2.0]: https://www.npmjs.com/package/wrap-chars/v/2.2.0
[2.1.0]: https://www.npmjs.com/package/wrap-chars/v/2.1.0
[2.0.0]: https://www.npmjs.com/package/wrap-chars/v/2.0.0
[1.0.1]: https://www.npmjs.com/package/wrap-chars/v/1.0.1
