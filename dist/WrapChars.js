"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * @class WrapChars
*/
// eslint-disable-next-line no-unused-vars
var WrapChars = /*#__PURE__*/function () {
  function WrapChars() {
    _classCallCheck(this, WrapChars);
  }

  _createClass(WrapChars, null, [{
    key: "wrap",

    /**
     * 
     * @param {Element} element 
     * @param {Object} params 
     */
    value: function wrap(element) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var type = params.type || 'letter',
          tagName = params.tagName || 'span',
          className = params.className,
          spaceChar = params.spaceChar;

      _parseNode(element);

      function _parseNode(node) {
        var n, w;

        switch (node.nodeType) {
          case 1:
            //element
            n = node.childNodes;

            for (var i = n.length; i > 0; i--) {
              // console.log(node);
              _parseNode(n[i - 1]);
            }

            break;

          case 3:
            //text
            if (!node.textContent.replace(/\s/g, '').length) {
              //node only contains whitespace
              break;
            } // node.parentNode.innerHTML = _wrap(node.textContent);


            n = document.createElement('span');
            w = _wrap(node.textContent);
            n.innerHTML = w; // console.log(n.childNodes);

            node.replaceWith.apply(node, _toConsumableArray(n.childNodes));
            break;

          default: //unsupported node type

        }
      }

      function _wrap(text) {
        var delimiter = type === 'word' ? ' ' : '',
            chars = text.split(delimiter),
            rslt = '';

        for (var _char = 0; _char < chars.length; _char++) {
          var letter = chars[_char] === ' ' && spaceChar ? spaceChar : chars[_char];
          var str = '';
          str += "<".concat(tagName);
          if (className && typeof className === 'string') str += " class=\"".concat(className, "\"");
          str += ">" + letter + "</".concat(tagName, ">");
          rslt += str;
        }

        return rslt;
      }
    }
  }]);

  return WrapChars;
}();