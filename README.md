# WrapChars.js

v3.0.0

## Contents

- [About](#about)
- [Setup](#setup)
- [Use](#use)
- [Configuration](#configuration)
- [Accessibility](#accessibility)
- [Browser support](#browser-support)
- [Known issues](#known-issues)
- [Development](#development)
- [Version history](#version-history)
- [Licence](#licence)
- [AI usage disclosure](#ai-usage-disclosure)

## About

Tiny script containing just two static methods: `wrap()` takes any element and wraps each inline character (or word) in a given tag, with an optional class, and `unwrap()` puts it all back again. Very small (around 4KB minified, under 2KB gzipped, no dependencies).

Version 1 of this was very blunt in its approach, stripping out any nested tags entirely. Version 2 was much more polite, and would do its best to preserve existing markup. Version 3 keeps that politeness, and adds proper handling of emoji and accented characters, the option to split punctuation from words, screen reader support out of the box, and the ability to undo it all (thanks, Claude).

From v3 the source is an ES module, with a classic script build still available for old-school `<script>` tags. v3 has some breaking changes from v2 - see the [changelog](CHANGELOG.md#upgrading-from-2x).

[Homepage/Demos](http://lab.adasha.com/components/wrap-chars/index.html) (Horrificly outdated, will get to it eventually)

## Setup

### npm/bundlers

Install from npm:

```sh
npm install wrap-chars
```

Then import it as an ES module:

```javascript
import WrapChars from 'wrap-chars';
```

A named export is also available, if you prefer: `import { WrapChars } from 'wrap-chars';`

### Browser module

You can import the module straight from UNPKG without installing anything:

```HTML
<script type="module">
    import WrapChars from 'https://unpkg.com/wrap-chars@3/dist/wrap-chars.mjs';
</script>
```

### Vanilla

Embed the classic script build from UNPKG, which adds a global `WrapChars` object:

```HTML
<script src="https://unpkg.com/wrap-chars@3"></script>
```

Or download [`wrap-chars.min.js`](https://unpkg.com/wrap-chars@3/dist/wrap-chars.min.js) and host it yourself.

Ensure the DOM has loaded completely before continuing, e.g. by adding `defer` to the script tag. Module scripts are deferred automatically.

## Use

```javascript
WrapChars.wrap(elementReference, [paramsObject]);
```

Say we have the following HTML:

```HTML
<blockquote cite="Lewis Carroll" id="poem">
    <span class="line">’Twas brillig, and the slithy toves</span><br>
    <span class="line">Did gyre and gimble in the wabe:</span><br>
    <span class="line">All mimsy were the borogoves,</span><br>
    <span class="line">And the mome raths outgrabe.</span>
</blockquote>
```

Grab a reference to the element you want to affect:

```javascript
const domElement = document.getElementById('poem');
```

To wrap the characters using the default settings, call the `WrapChars.wrap()` static method using the reference as the argument:

```javascript
WrapChars.wrap(domElement);
```

You could also iterate over a NodeList if you prefer:

```javascript
const lines = document.querySelectorAll('.line');
lines.forEach(line => WrapChars.wrap(line));
```

Runs of whitespace (spaces, tabs, line breaks) are reduced to a single space. Non-breaking and other Unicode spaces such as `&nbsp;` and `&ensp;` are treated as ordinary characters, so `non&nbsp;breaking` stays one word with `split: "word"`. Text nodes containing only whitespace are ignored completely.

Letters are split the way a reader would see them, so emoji like 👍🏽 or 👨‍👩‍👧, flags, and letters with combining accents each stay together as one piece.

### Styling and repeat calls

Every element `WrapChars` creates carries a `data-wrapchars` attribute, which makes a handy styling hook:

| Value | Element |
| --- | --- |
| `"piece"` | A wrapped letter, word or punctuation mark. |
| `"space"` | A wrapped space, or a replacement `spaceChar`. |
| `"text"` | The hidden screen reader copy (see [Accessibility](#accessibility)). |

```css
#poem [data-wrapchars="piece"] {
    display: inline-block;
}
```

Calling `wrap()` again on the same element skips anything already marked, so it's safe to repeat, and will only wrap text that has been added since.

### Unwrapping

To reverse the process, call `unwrap()` on the same element (or an ancestor):

```javascript
WrapChars.unwrap(domElement);
```

This replaces every marked element with plain text and merges the text back together, leaving your other markup in place. Whitespace stays collapsed as `wrap()` left it, and any `spaceChar` reverts to a normal space. If you need the exact original markup back, store a copy before wrapping.

## Configuration

`WrapChars.wrap()` accepts two arguments:

| Argument | Type | Description |
| --- | --- | --- |
| `element` | Element | A reference to a DOM element, e.g. as obtained via `querySelector()` or `getElementById()`. |
| `params` | Object | (optional) An object containing key/value pairs to configure the method (see below). |

`WrapChars.unwrap()` accepts just the `element`.

### `params` object

The `params` object can contain the following properties, all optional:

| Property | Type | Description |
| --- | --- | --- |
| `split` | string | Defines how text nodes will be subdivided for wrapping. Takes a value of `"letter"` or `"word"`. Default is `"letter"`. |
| `tagName` | string | The type of element that will be wrapped around each character. Void elements (e.g. `img`, `br`) and elements that don't make sense or aren't safe to wrap text in (e.g. `script`, `style`, `iframe`, `textarea`, `template`) aren't allowed. Default is `"span"`. |
| `className` | string | The class name that can be applied to each wrapped element. Default is *undefined*. |
| `deep` | Boolean | Boolean value where, if true, will parse the entire DOM tree of the element. If false will only wrap inline text of the element itself. Default is `true`. |
| `wrapSpaces` | Boolean | Boolean value to specify if spaces should be wrapped. If a value is set for `spaceChar` those characters are also subject to this setting. Default is `false`. |
| `skipClass` | string | If specified, any element with a matching class name will be ignored. Default is *undefined*. |
| `spaceChar` | string | The character to replace spaces with, if specified. The value is standardised internally, so can be a raw character, an escaped hexcode, a Unicode code or an HTML entity. Any markup is kept as literal text, never parsed as HTML. When `wrapSpaces` is `false`, each replacement is placed in a plain `<span data-wrapchars="space">` (without `className`) so `unwrap()` can restore it. `WrapChars.wrap()` intentionally does not convert existing HTML entities, so certain results can be achieved by adding them beforehand. Default is *undefined*. |
| `separatePunctuation` | Boolean | Only applies when `split` is `"word"`. If true, punctuation before or after a word (e.g. `(`, `,`, `...`, `?!`) is wrapped as a separate piece. Punctuation inside a word, as in *don't*, *3.14* or *well-known*, stays put, as do symbols and emoji. Default is `false`. |
| `punctuationClass` | string | Class name for punctuation pieces when `separatePunctuation` is on, so they can be styled separately. If not set, punctuation gets the same `className` as words. Default is *undefined*. |
| `accessible` | Boolean | Keeps the text readable by screen readers (see [Accessibility](#accessibility)). Default is `true`. |

#### Example

```javascript
WrapChars.wrap(myElement, {
    split: "word",
    tagName: "div",
    className: "wrapped_content",
    deep: false,
    wrapSpaces: true,
    skipClass: "skip_this",
    spaceChar: "&nbsp;",
    separatePunctuation: true,
    punctuationClass: "wrapped_punctuation"
});
```

### Errors

Options are checked before anything is changed, so a bad value will never leave your markup half-wrapped.

| Error | Thrown when |
| --- | --- |
| `TypeError` | `element` isn't a DOM element, or the removed v2 `type` option is used (use `split` instead). |
| `RangeError` | `split` isn't `"letter"` or `"word"`, or `tagName` isn't a valid or permitted element name. |

## Accessibility

Splitting text into lots of little elements can confuse screen readers, some of which will spell it out piece by piece or pause between each one. To avoid this, `accessible` is on by default:

- Each wrapped text node gets a visually hidden `<span data-wrapchars="text">` containing the original text, which is what screen readers will read.
- Every piece gets `aria-hidden="true"`, as does any replacement `spaceChar`, so it isn't read out as, say, "bullet" between each word.

The hidden copy is styled via inline CSS properties, so there's no stylesheet to include, and it works under a strict Content Security Policy. It's also excluded from text selection, so copying the text won't give you everything twice.

Points of note:

- Avoid focusable elements such as `button` for `tagName` with this on, as hidden elements shouldn't be focusable.
- If you style or animate pieces with selectors like `#poem span`, the hidden copy will match too. Use `[data-wrapchars="piece"]` or a `className` instead.

Set `accessible: false` if you're handling accessibility yourself.

## Browser support

Any browser that supports ES2022: Chrome and Edge 93+, Firefox 92+, Safari 15.4+.

Splitting letters by what a reader sees, and the full `separatePunctuation` behaviour, rely on `Intl.Segmenter`, which arrived later in Firefox (version 125). In older browsers without it, `WrapChars` falls back gracefully (see below).

## Known issues

- In browsers without `Intl.Segmenter` (Firefox before 125), letters are split by Unicode code point instead, so emoji sequences like 👍🏽 and combining accents may be split apart. `separatePunctuation` only splits punctuation from the start and end of each space-separated word, so dashes between words (*a—b*) and punctuation in unspaced scripts like Chinese stay attached.
- `unwrap()` can't restore whitespace that `wrap()` collapsed. This makes no visual difference unless the text is styled with something like `white-space: pre`.

## Development

You'll need Node 24 (there's an `.nvmrc`, so `nvm use` will sort you out).

```sh
npm install
npm test            # run the test suite once
npm run test:watch  # re-run tests as you edit
npm run lint        # check code style
npm run build       # build dist/wrap-chars.mjs and dist/wrap-chars.min.js
```

The `tests` folder also contains some HTML pages for eyeballing the results, including an interactive test suite with controls for every option. These import the source as a module, so need serving over HTTP rather than opening directly, e.g. with `npx serve` from the project folder.

## Version history

- v3.0   - Modernised, hardened and made accessible. Breaking changes, see the [changelog](CHANGELOG.md).
- v2.4   - Hardened codebase.
- v2.3   - Added ES6 modular versions.
- v2.2   - Added *wrapSpaces* property, renamed *type* to *split*.
- v2.1   - Added *deep* and *skipClass* properties, improved whitespace handling.
- v2.0   - Near complete rewrite to play nicer with other people's markup
- v1.0   - Original version

## Licence

Released under the [GNU Lesser General Public License v3.0](LICENSE). As the LGPL builds on the GNU General Public License, a copy of that is included too, in [COPYING](COPYING).

## AI usage disclosure

This project has used AI since v2.4 to assist with hardening, accessibility and other code improvements. All AI contributions are reviewed by a human.
