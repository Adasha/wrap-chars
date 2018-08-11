'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WrapChars = function () {
    function WrapChars() {
        _classCallCheck(this, WrapChars);
    }

    _createClass(WrapChars, null, [{
        key: 'wrap',
        value: function wrap(element) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'letter';
            var el = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'span';
            var className = arguments[3];

            var delimiter = type === 'word' ? ' ' : '';

            var text = element.textContent,
                chars = text.split(delimiter),
                rslt = [];

            for (var char = 0; char < chars.length; char++) {
                var str = '';
                var letter = chars[char] === ' ' ? '&ensp;' : chars[char];
                str += '<' + el;
                if (className && typeof className === 'string') str += ' class="' + className + '"';
                str += '>' + letter + ('</' + el + '>');
                rslt.push(str);
            }

            element.innerHTML = rslt.join(delimiter);

            return element;
        }
    }]);

    return WrapChars;
}();