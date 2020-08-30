# WrapChars.js

## About
Tiny script containing just one, static method that takes any element and wraps each inline character in a given tag, with an optional class. Very tiny (2KB minified).

Version 1 of this was very blunt in its approach, stripping out any nested elements entirely. This version is much more polite, and will do its best to preserve any existing markup.

The syntax has also changed almost completely, but should now allow for more graceful changes in the future.

[Demo](http://adasha.com/lab/proximity-effect/5.html)

## Setup

Download one of the JavaScript files from the `dist` folder, probably the minified one.
Import it 

## Use



Note, this is a destructive process. If you think you may want to revert to the original HTML structure at any point you will need to store a copy of the original markup before processing:

```javascript
let originalMarkup = 
```




```javascript
WrapChars.wrap(domElement, {type:'letter'|'word', tagName:_elementName_[String], String:className[String]});
```
