/**
 * WrapChars Class
 * @class WrapChars
 * @version 2.0.2
 * @author Adam Shailer <adasha76@outlook.com>
*/

// eslint-disable-next-line no-unused-vars
class WrapChars
{


    /**
     * 
     * @static
     * @method wrap
     * @param {Element} element - A reference to a DOM element.
     * @param {Object} [params={}] - An object containing key/value pairs used to configure the method.
     * @param {string} [params.type="letter"] - The method by which text will be divided. "letter"|"word"
     * @param {string} [params.tagName="span"] - The name of the element to wrap each character in.
     * @param {string} [params.className] - An optional class name to add to each element.
     * @param {string} [params.spaceChar] - An optional character to replace inline spaces with. Can include HTML entities such as "&ensp;".
     */
    static wrap(element, params = {})
    {
        let type = params.type || 'letter',
            tagName = params.tagName || 'span',
            className = params.className,
            spaceChar = params.spaceChar;


            _parseNode(element);



        function _parseNode(node)
        {
            let n, w;
            switch(node.nodeType)
            {
                case 1 : //element
                    n = node.childNodes;
                    for(let i=n.length; i>0; i--)
                    {
                        // console.log(node);
                        _parseNode(n[i-1]);
                    }
                    break;
                case 3 : //text
                    if (!node.textContent.replace(/\s/g, '').length)
                    {
                        //node only contains whitespace
                        break;
                    }
                    // node.parentNode.innerHTML = _wrap(node.textContent);
                    n = document.createElement('span');
                    w = _wrap(node.textContent);
                    
                    n.innerHTML = w;
                    // console.log(n.childNodes);
                    node.replaceWith(...n.childNodes);
                    break;
                default:
                    //unsupported node type
            }
        }



        function _wrap(text)
        {

            let delimiter = type==='word' ? ' ' : '',
                chars = text.split(delimiter),
                rslt = '';

            for(let char=0; char<chars.length; char++)
            {
                let letter = (chars[char]===' ' && spaceChar) ? spaceChar : chars[char];
                let str = '';

                str += `<${tagName}`;
                if(className && typeof className==='string') str += ` class="${className}"`;
                str += `>` + letter + `</${tagName}>`;

                rslt += str;

            }
            return rslt;
        }


    }



}
