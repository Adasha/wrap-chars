
# WrapChars.js

V2.4.0a1 *dist builds are behind, don't use

## Contents

- [About](#about)
- [Setup](#setup)
- [Use](#use)
- [Known issues](#known-issues)
- [Version history](#version-history)
- [AI usage disclosure](#ai-usage-disclosure)

## About

Tiny script containing just one, static method that takes any element and wraps each inline character in a given tag, with an optional class. Very small (<3KB minified, no dependencies).

Version 1 of this was very blunt in its approach, stripping out any nested tags entirely. This version is much more polite, and will do its best to preserve existing markup. It has several ways to control the wrapping process.

From v2.3 also implemented as a module. In progress.

[Homepage/Demos](http://lab.adasha.com/components/wrap-chars/index.html)


## Setup

### Vanilla

Download one of the [JavaScript files from the `dist` folder](https://github.com/Adasha/wrap-chars/tree/master/dist), probably the minified one.
Import it into your HTML:

```HTML
<script src="WrapChars.min.js"></script>
```

You can also embed from UNPKG:

```HTML
<script src="https://www.unpkg.com/wrap-chars"></script>
```

Ensure the DOM has loaded completely before continuing.

### npm/browserify/webpack etc

You can also import wrap-chars as an ES6 module. This is an early implementation and not ready for real-world use.

```
import WrapChars from './path/to/WrapChars.min.mjs';
```

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
let domElement = document.getElementById ('poem');
```

To wrap the characters using the default settings, call the `WrapChars.wrap()` static method using the reference as the argument:

```javascript
WrapChars.wrap (domElement);
```

You could also iterate over a NodeList if you prefer:

```javascript
let lines = document.querySelectorAll ('*.lines');
lines.forEach (line => WrapChars.wrap (line));
```

Every element `WrapChars` creates carries a `data-wrapchars` attribute: `"piece"` for wrapped letters, words and punctuation, `"space"` for wrapped or replaced spaces, and `"text"` for the hidden screen-reader copy (see `accessible` below). Calling `wrap()` again on the same element skips anything already marked, so it's safe to repeat, and it wraps only text that was added since.

To reverse the process, call `unwrap()` on the same element (or an ancestor):

```javascript
WrapChars.unwrap(domElement);
```

This replaces every marked element with plain text and merges the text back together, leaving your other markup in place. Whitespace stays collapsed as `wrap()` left it (see below), and any `spaceChar` reverts to a normal space. If you need the exact original markup back, store a copy before wrapping.

Runs of whitespace (spaces, tabs, line breaks) are reduced to a single space, matching how browsers render them. Non-breaking and other Unicode spaces such as `&nbsp;` and `&ensp;` are treated as ordinary characters, so `non&nbsp;breaking` stays one word with `split: "word"`. Text nodes containing only whitespace are ignored completely.

### Configuration

`WrapChars.wrap()` accepts two arguments:

| Argument | Type | Description |
| --- | --- | --- |
| `element` | HTMLElement | A reference to a DOM element, e.g. as obtained via `querySelector()` or `getElementById()`. |
| `params` | Object | (optional) An object containing key/value pairs to configure the method (see below). |

#### `params` object

The `params` object can contain the following properties, all optional:

| Property | Type | Description |
| --- | --- | --- |
| `split` | string | Defines how text nodes will be subdivided for wrapping. Currently takes a value of `"letter"` or `"word"`. Default is `"letter"`. Any other value throws a `RangeError`. (`split` replaced `type` in v2.2; the `type` alias was removed in v3 and now throws.) |
| `tagName` | string | The type of element that will be wrapped around each character. Default is `"span"`. |
| `className` | string | The class name that can be applied to each wrapped element. Default is *undefined*. |
| `deep` | Boolean | Boolean value where, if true, will parse the entire DOM tree of the element. If false will only wrap inline text of the element itself. Default is `true`. |
| `wrapSpaces` | Boolean | Boolean value to specify if spaces should be wrapped. If a value is set for `spaceChar` those characters are also subject to this setting. Default is `false` |
| `skipClass` | string | If specified, any element with a matching class name will be ignored. Default is *undefined*. |
| `spaceChar` | string | The character to replace spaces with, if specified. The value is standardised internally, so can be a raw character, an escaped hexcode, a Unicode code or an HTML entity. Any markup is kept as literal text, never parsed as HTML. When `wrapSpaces` is `false`, each replacement is placed in a plain `<span data-wrapchars="space">` (without `className`) so `unwrap()` can restore it. `WrapChars.wrap()` intentionally does not convert existing HTML entities, so certain results can be achieved by adding them beforehand. Default is *undefined*. |
| `separatePunctuation` | Boolean | Only applies when `split` is `"word"`. If true, punctuation before or after a word (e.g. `(`, `,`, `...`, `?!`) is wrapped as a separate piece. Punctuation inside a word, as in *don't*, *3.14* or *well-known*, stays put. In browsers without `Intl.Segmenter` (Firefox before 125), only punctuation at the start or end of each space-separated word is split off. Default is `false`. |
| `punctuationClass` | string | Class name for punctuation pieces when `separatePunctuation` is on, so they can be styled separately. If not set, punctuation gets the same `className` as words. Default is *undefined*. |
| `accessible` | Boolean | Keeps the text readable by screen readers, which otherwise may spell it out piece by piece. Each wrapped text node gets a visually hidden `<span>` containing the original text, and every piece (and any unwrapped `spaceChar`) gets `aria-hidden="true"`. The hidden copy is styled via inline CSS properties, so no stylesheet is needed, and is excluded from text selection so copied text isn't duplicated. Avoid focusable `tagName`s such as `button` with this on. Default is `true`. |

##### Example

```javascript
WrapChars.wrap(myElement, {
    split: "word",
    tagName: "div",
    className: "wrapped_content",
    deep: false,
    wrapSpaces: true,
    skipClass: "skip_this",
    spaceChar: "&nbsp;"
});
```

## Known issues

- Certain (unlikely) combinations of HTML mark-up can cause empty elements to be added when `wrapSpaces` is `true` and `split` is equal to `word`. Can be fixed with minor HTML reformatting.

## Version history

- v2.4   - Hardened codebase.
- v2.3   - Added ES6 modular versions.
- v2.2   - Added *wrapSpaces* property, renamed *type* to *split*.
- v2.1   - Added *deep* and *skipClass* properties, improved whitespace handling.
- v2.0   - Near complete rewrite to play nicer with other people's markup
- v1.0   - Original version

## AI usage disclosure

This project is proudly hand-scripted. AI has been used to aid in bug fixing and exploit hunting, but all AI contributions are manually validated.