"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * WrapChars Class
 * @class WrapChars
 * @version 2.2.0
 * @author Adam Shailer <adasha76@outlook.com>
*/
// eslint-disable-next-line no-unused-vars
var WrapChars =
/*#__PURE__*/
function () {
  function WrapChars() {
    _classCallCheck(this, WrapChars);
  }

  _createClass(WrapChars, null, [{
    key: "wrap",

    /**
     * Wrap inline text characters/words with HTML elements.
     * 
     * @param {Element} element - A reference to a DOM element.
     * @param {Object} [params={}] - An object containing key/value pairs used to configure the method.
     * @param {string} [params.split="letter"] - The method by which text will be divided. "letter"|"word". This property was previously called `type` - `type` still exists as an alias but is deprecated.
     * @param {string} [params.tagName="span"] - The name of the element to wrap each character in.
     * @param {string} [params.className] - An optional class name to add to each element.
     * @param {boolean} [params.deep=true] - Whether to also wrap the text within nested elements.
     * @param {boolean} [params.wrapSpaces=false] - If true, will wrap space characters.
     * @param {string} [params.skipClass=false] - If provided, will pass over any elements with that class. 
     * @param {string} [params.spaceChar] - An optional character to replace inline spaces with. Can include HTML entities such as "&amp;ensp;". Will override 'wrapSpaces'.
     * @method
     * @static
     */
    value: function wrap(element) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var split = params.split || params.type || "letter",
          tagName = params.tagName || "span",
          className = params.className,
          spaceChar = params.spaceChar,
          deep = params.hasOwnProperty("deep") ? params.deep : true,
          skipClass = params.skipClass,
          wrapSpaces = params.hasOwnProperty("wrapSpaces") ? params.wrapSpaces : false;

      _parseNode(element);
      /**
       * 
       * @param {HTMLElement} node - The node to process.
       */


      function _parseNode(node) {
        var n, t;

        switch (node.nodeType) {
          case 1:
            //element
            // console.log(node + ': ' + node.children.length +' / '+ node.childNodes.length);
            if (skipClass && typeof skipClass === "string" && node.classList.contains(skipClass)) {
              break;
            }

            n = node.childNodes;

            for (var i = n.length; i > 0; i--) {
              if (deep || n[i - 1].nodeType === 3) {
                _parseNode(n[i - 1]);
              }
            }

            break;

          case 3:
            //text
            t = node.textContent;

            if (!t.replace(/\s\s+/g, "").length) {
              //node only contains whitespace
              break;
            } // t = t.trimStart().trimEnd();


            t = t.replace(/\s\s+/g, " ");
            n = document.createElement("span");
            n.innerHTML = _wrap(t);
            node.replaceWith.apply(node, _toConsumableArray(n.childNodes));
            break;

          default: //unsupported node type

        }
      }
      /**
       * 
       * @param {string} text - The text to wrap.
       * @returns {string} The processed HTML string.
       */


      function _wrap(text) {
        var delimiter = split === "word" ? " " : "",
            chars = text.split(delimiter),
            rslt = ""; //restore spaces if split type = 'word'

        if (split === "word") {
          for (var i = chars.length; i > 1; i--) {
            chars.splice(i - 1, 0, " ");
          }
        }

        for (var _char = 0; _char < chars.length; _char++) {
          var letter = chars[_char] === " " && spaceChar ? spaceChar : chars[_char];
          var str = "";

          if (!wrapSpaces && letter === " ") {
            str += " ";
          } else {
            str += "<".concat(tagName);
            if (className && typeof className === 'string') str += " class=\"".concat(className, "\"");
            str += ">" + letter + "</".concat(tagName, ">");
          }

          rslt += str;
        }

        return rslt;
      }
    }
  }]);

  return WrapChars;
}(); // export { WrapChars }