"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WrapChars = /*#__PURE__*/function () {
  function WrapChars() {
    _classCallCheck(this, WrapChars);
  }

  _createClass(WrapChars, null, [{
    key: "wrap",
    value: function wrap(element) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'letter';
      var el = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'span';
      var className = arguments.length > 3 ? arguments[3] : undefined;
      var delimiter = type === 'word' ? ' ' : '';
      var text = element.textContent,
          chars = text.split(delimiter),
          rslt = [];

      for (var _char = 0; _char < chars.length; _char++) {
        var str = '';
        var letter = chars[_char] === ' ' ? '&ensp;' : chars[_char];
        str += "<".concat(el);
        if (className && typeof className === 'string') str += " class=\"".concat(className, "\"");
        str += '>' + letter + "</".concat(el, ">");
        rslt.push(str);
      }

      element.innerHTML = rslt.join(delimiter);
      return element;
    }
  }]);

  return WrapChars;
}();