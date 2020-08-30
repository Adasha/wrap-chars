"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Known issues:
 * - replacing node contents doesn't work. workaround leaves extraneous HTML
 * - whitespace in html gets added as nodes
*/
// eslint-disable-next-line no-unused-vars
var WrapChars = /*#__PURE__*/function () {
  function WrapChars() {
    _classCallCheck(this, WrapChars);
  }

  _createClass(WrapChars, null, [{
    key: "wrap",
    value: function wrap(element) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var type = params.type || 'letter',
          tagName = params.tagName || 'span',
          className = params.className,
          spaceChar = params.spaceChar || '&ensp;';

      _parseNode(element);

      function _parseNode(node) {
        var n, w;

        switch (node.nodeType) {
          case 1:
            //element
            n = node.childNodes;

            for (var i = 0; i < n.length; i++) {
              // console.log(node);
              _parseNode(n[i]);
            }

            break;

          case 3:
            //text
            // node.parentNode.innerHTML = _wrap(node.textContent);
            n = document.createElement('span');
            w = _wrap(node.textContent);
            n.innerHTML = w; // console.log(n.childNodes);
            // node.parentNode.replaceChild(n.childNodes, node);

            node.replaceWith(n);
            break;

          default: //unsupported node type

        }
      }

      function _wrap(text) {
        var delimiter = type === 'word' ? ' ' : '',
            chars = text.split(delimiter),
            rslt = '';

        for (var _char = 0; _char < chars.length; _char++) {
          var letter = chars[_char] === ' ' ? spaceChar : chars[_char];
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