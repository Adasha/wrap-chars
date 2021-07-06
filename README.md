
# WrapChars.js

V2.2.4

## Contents

- [About](#about)
- [Setup](#setup)
- [Use](#use)
- [Known issues](#known-issues)
- [Version history](#version-history)

## About

Tiny script containing just one, static method that takes any element and wraps each inline character in a given tag, with an optional class. Very small (<3KB minified, no dependencies).

Version 1 of this was very blunt in its approach, stripping out any nested tags entirely. This version is much more polite, and will do its best to preserve existing markup. It has several ways to control the wrapping process.

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

tbc

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

Note that this is a destructive process. If you think you may want to revert to the original HTML structure at any point you will need to store a copy of the original markup before applying the method.

Any whitespace is reduced down to a single space. Text nodes containing only whitespace are ignored completely.

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
| `split` | string | Defines how text nodes will be subdivided for wrapping. Currently takes a value of `"letter"` or `"word"`. Default is `"letter"`. `split` replaces `type` since v2.2, though `type` still exists as an alias. |
| `tagName` | string | The type of element that will be wrapped around each character. Default is `"span"`. |
| `className` | string | The class name that can be applied to each wrapped element. Default is *undefined*. |
| `deep` | Boolean | Boolean value where, if true, will parse the entire DOM tree of the element. If false will only wrap inline text of the element itself. Default is `true`. |
| `wrapSpaces` | Boolean | Boolean value to specify if spaces should be wrapped. If a value is set for `spaceChar` those characters are also subject to this setting. Default is `false` |
| `skipClass` | string | If specified, any element with a matching class name will be ignored. Default is *undefined*. |
| `spaceChar` | string | The character to replace spaces with, if specified. The value is standardised internally, so can be a raw character, an escaped hexcode, a Unicode code or an HTML entity. HTML elements are stripped out, to limit exploits. `WrapChars.wrap()` intentionally does not convert existing HTML entities, so certain results can be achieved by adding them beforehand. Default is *undefined*. |

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

- `word` type can't differentiate between words and punctuation. To work around this, pre-wrap characters and make use of `skipClass`.
- Certain (unlikely) combinations of HTML mark-up can cause empty elements to be added when `wrapSpaces` is `true` and `split` is equal to `word`. Can be fixed with minor HTML reformatting.
- CodeQL flags a couple of lines for passing DOM text directly into HTML. Since elements are removed first I am not convinced this is an issue.

## Version history

- v2.2 - Added *wrapSpaces* property, renamed *type* to *split*.
- v2.1 - Added *deep* and *skipClass* properties, improved whitespace handling.
- v2.0 - Near complete rewrite to play nicer with other people's markup
- v1.0 - Original version
