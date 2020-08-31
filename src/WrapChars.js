/**
 * @class WrapChars
*/

// eslint-disable-next-line no-unused-vars
class WrapChars
{


    /**
     * 
     * @param {Element} element 
     * @param {Object} params 
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
