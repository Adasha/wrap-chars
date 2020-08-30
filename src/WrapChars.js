/**
 * Known issues:
 * - replacing node contents doesn't work. workaround leaves extraneous HTML
 * - whitespace in html gets added as nodes
*/

// eslint-disable-next-line no-unused-vars
class WrapChars
{



    static wrap(element, params = {})
    {
        let type = params.type || 'letter',
            tagName = params.tagName || 'span',
            className = params.className,
            spaceChar = params.spaceChar || '&ensp;';


            _parseNode(element);




        function _parseNode(node)
        {
            let n, w;
            switch(node.nodeType)
            {
                case 1 : //element
                    n = node.childNodes;
                    for(let i=0; i<n.length; i++)
                    {
                        // console.log(node);
                        _parseNode(n[i]);
                    }
                    break;
                case 3 : //text
                    // node.parentNode.innerHTML = _wrap(node.textContent);
                    n = document.createElement('span');
                    w = _wrap(node.textContent);
                    
                    n.innerHTML = w;
                    // console.log(n.childNodes);
                    // node.parentNode.replaceChild(n.childNodes, node);
                    node.replaceWith(n);
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
                let letter = chars[char]===' ' ? spaceChar : chars[char];
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
