/**
 * WrapChars Class - wrap inline letters/words in HTML elements.
 * @class WrapChars
 * @version 2.2.4
 * @author Adam Shailer <adasha76@outlook.com>
*/
// eslint-disable-next-line no-unused-vars
class WrapChars
{


    /**
     * wrap()
     * Wrap inline text characters/words with HTML elements.
     * 
     * @param {Element} element - A reference to a DOM element.
     * @param {Object} [params={}] - An object containing key/value pairs used to configure the method.
     * @param {string} [params.split="letter"] - The method by which text will be divided. "letter"|"word". This property was previously called `type` - `type` still exists as an alias but is deprecated.
     * @param {string} [params.tagName="span"] - The name of the element to wrap each character in.
     * @param {string} [params.className] - An optional class name to add to each element.
     * @param {boolean} [params.deep=true] - Whether to also wrap the text within nested elements.
     * @param {boolean} [params.wrapSpaces=false] - If true, will wrap space characters, including spaceChar if specified.
     * @param {string} [params.skipClass=false] - If provided, will pass over any elements with that class. 
     * @param {string} [params.spaceChar] - An optional string to replace inline spaces with. Will be sanitised to standard text internally.
     * @method
     * @static
     */
    static wrap(element, params = {})
    {
        let split = params.split || params.type || "letter",
            tagName = params.tagName || "span",
            className = params.className,
            spaceChar = _sanitiseSpaceChar(params.spaceChar),
            deep = params.hasOwnProperty("deep") ? params.deep : true,
            skipClass = params.skipClass,
            wrapSpaces = params.hasOwnProperty("wrapSpaces") ? params.wrapSpaces : false;


        _parseNode(element);


        /**
         * _sanitiseSpaceChar()
         * 
         * @param {string} str 
         * @returns {string}
         */
        function _sanitiseSpaceChar(str)
        {
            let e = document.createElement("span");
            e.innerHTML = str;
            let txt = e.textContent;
            // txt = txt.replace(/&/g, '&amp;'); // "
            // txt = txt.replace(/</g, '&lt;'); // <
            // txt = txt.replace(/>/g, '&gt;'); // >
            // txt = txt.replace(/"/g, '&quot;'); // "
            return txt;
        }


        
        /**
         * _parseNode()
         * 
         * @param {HTMLElement} node - The node to process.
         */
        function _parseNode(node)
        {
            let n, t;
            switch(node.nodeType)
            {
                case 1 : //element
                    // console.log(node + ': ' + node.children.length +' / '+ node.childNodes.length);

                    if(skipClass && node.classList.contains(skipClass))
                    {
                        break;
                    }

                    n = node.childNodes;
                    for(let i=n.length; i>0; i--)
                    {
                        if(deep || n[i-1].nodeType===3)
                        {
                            _parseNode(n[i-1]);
                        }
                    }
                    break;
                case 3 : //text
                    t = node.textContent;
                    if(!t.replace(/\s\s+/g, "").length)
                    {
                        //node only contains whitespace
                        break;
                    }

                    // t = t.trimStart().trimEnd();
                    t = t.replace(/\s\s+/g, " ");
                    
                    n = document.createElement("span");
                    n.innerHTML = _wrap(t);
                    node.replaceWith(...n.childNodes);

                    break;
                default:
                    //unsupported node type
            }
        }


        /**
         * _wrap()
         * 
         * @param {string} text - The text to wrap.
         * @returns {string} The processed HTML string.
         */
        function _wrap(text)
        {
            let delimiter = split==="word" ? " " : "",
                chars = text.split(delimiter),
                rslt = "";
            
            //restore spaces if split type = 'word'
            if(split==="word")
            {
                for (let i=chars.length; i>1; i--)
                {
                    chars.splice(i-1, 0, " ");
                }
            }

            for(let char=0; char<chars.length; char++)
            {
                let letter = (chars[char]===" " && spaceChar) ? spaceChar : chars[char],
                    str    = "";

                if(!wrapSpaces && (letter===" " || letter===spaceChar))
                {
                    str += spaceChar || " ";
                }
                else if(letter.length)
                {
                    str += `<${tagName}`;
                    if(className && typeof className==='string' && className.length) str += ` class="${className}"`;
                    str += `>` + letter + `</${tagName}>`;
                }
                

                rslt += str;
            }

            return rslt;
        }


    }



}

// export { WrapChars }