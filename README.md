# WrapChars.js

## About
Tiny script containing just one, static method that takes any element and wraps each inline character in a given tag, with an optional class. Very tiny (3KB minified).

Version 1 of this was very blunt in its approach, stripping out any nested elements entirely. This version is much more polite, and will do its best to preserve any existing markup.

The syntax has also changed almost completely, but should now allow for more graceful changes in the future.

[Demo](http://adasha.com/lab/wrap-chars.html)


## Setup

### Vanilla

Download one of the JavaScript files from the `dist` folder, probably the minified one.
Import it into your HTML:

```HTML
<script src="WrapChars.min.js"></script>
```
Ensure the DOM has loaded completely before continuing.


## Use

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
let domElement = document.getElementById('poem');
```

To wrap the characters using the default settings, call the `WrapChars.wrap()` static method using the reference as the argument:

```javascript
WrapChars.wrap(domElement);
```


You could also iterate over a NodeList if you prefer:

```javascript
let lines = document.querySelectorAll('*.lines');
lines.forEach(line => WrapChars.wrap(line));
```


Note that this is a destructive process. If you think you may want to revert to the original HTML structure at any point you will need to store a copy of the original markup before applying the method.


### Configuration

WrapChars accepts two arguments:

- `element` - a reference to a DOM element, e.g. as obtained via `querySelector()` or `getElementById()`.
- `params` - (optional) an object containing key/value pairs to configure the method (see below).


#### `params` object

The `params` object can contain the following properties, all optional:

- `type` - Defines how text nodes will be subdivided for wrapping. Currently takes a value of `'letter'` or `'word'`. Default is `letter`. `word` is a bit buggy ATM.
- `tagName` - The type of element that will be wrapped around each character. Default is `'span'`.
- `className` - The class name that can be applied to each wrapped element. Default is *none*.
- `spaceChar` - The character to replace spaces with, if specified. This can be an HTML entity, such as `&ensp;`. Default is *none*.


## Known issues

- Using type `word` strips out spaces.
- `word` type also doesn't deal with punctuation as preferred.
- Completely interferes with text wrapping.

