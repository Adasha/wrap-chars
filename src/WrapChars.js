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
     * @param {string} [params.spaceChar] - An optional character to replace inline spaces with. Can include HTML entities such as "&amp;ensp;".
     * @param {boolean} [params.deep=true] - Whether to also wrap the text within nested elements.
     */
    static wrap(element, params = {})
    {
        let type = params.type || "letter",
            tagName = params.tagName || "span",
            className = params.className,
            spaceChar = params.spaceChar,
            deep = params.deep || true;


        _parseNode(element);


        /**
         * 
         * @param {HTMLElement} node - The node to process.
         */
        function _parseNode(node)
        {
            let n;
            switch(node.nodeType)
            {
                case 1 : //element
                    n = node.childNodes;
                    for(let i=n.length; i>0; i--)
                    {
                        // console.log(n[i-1].nodeType);
                        // if(n[i-1].nodeType===1 && deep)
                        // {
                            _parseNode(n[i-1]);
                        // }
                    }
                    break;
                case 3 : //text
                    if(!node.textContent.replace(/\s/g, "").length)
                    {
                        //node only contains whitespace
                        break;
                    }

                    n = document.createElement("span");
                    n.innerHTML = _wrap(node.textContent);
                    node.replaceWith(...n.childNodes);

                    break;
                default:
                    //unsupported node type
            }
        }


        /**
         * 
         * @param {string} text - The text to wrap.
         * @returns {string} The processed HTML string.
         */
        function _wrap(text)
        {
            let delimiter = type==="word" ? " " : "",
                chars = text.split(delimiter),
                rslt = "";
            
            //restore spaces if split type = 'word'
            if(type==="word")
            {
                for (let i=chars.length; i>1; i--)
                {
                    chars.splice(i-1, 0, " ");
                }
            }

            for(let char=0; char<chars.length; char++)
            {
                let letter = (chars[char]===" " && spaceChar) ? spaceChar : chars[char];
                let str = "";

                str += `<${tagName}`;
                if(className && typeof className==='string') str += ` class="${className}"`;
                str += `>` + letter + `</${tagName}>`;

                rslt += str;
            }

            return rslt;
        }


    }



}
