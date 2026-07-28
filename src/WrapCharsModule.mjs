/**
 * WrapChars Class - wrap inline letters/words in HTML elements.
 * @class WrapChars
 * @version 2.3.0a1
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
     * @param {string} [params.tagName="span"] - The name of the element to wrap each character in, defaults to <span>.
     * @param {string} [params.className] - An optional class name to add to each element.
     * @param {boolean} [params.deep=true] - Whether to also wrap the text within nested elements. Default is true.
     * @param {boolean} [params.wrapSpaces=false] - If true, will wrap space characters, including spaceChar if specified.
     * @param {string} [params.skipClass] - If provided, will pass over any elements with that class. 
     * @param {string} [params.spaceChar] - An optional string to replace inline spaces with. Will be sanitised to standard text internally.
     * @method
     * @static
     */
    static wrap(element, params = {})
    {
        // validate tag name
        const VOID_ELEMENTS = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
        const DISALLOWED    = new Set(["script","style","iframe","object","embed"]);
        if(VOID_ELEMENTS.has(tagName) || DISALLOWED.has(tagName))
        {
            throw new Error(`WrapChars: invalid tagName "${tagName}"`);
        }


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
            if (!str) return;

            let e = document.createElement("span");
            e.innerHTML = str;
            let txt = e.textContent;
            
            return txt;
        }


        
        /**
         * _parseNode()
         * Recursively traverse the node tree to isolate and wrap text nodes.
         * 
         * @param {HTMLElement} node - The node to process.
         */
        function _parseNode(node)
        {
            let n, t;
            switch(node.nodeType)
            {
                case 1 : //element
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

                    t = t.replace(/\s\s+/g, " ");

                    node.replaceWith(_wrap(t));

                    break;

                default:
                    //unsupported node type

            }

        }


        /**
         * _wrap()
         * Private method for constructing output.
         * 
         * @param {string} text - The text to wrap.
         * @returns {string} The processed HTML string.
         */
        function _wrap(text) {
            const frag = document.createDocumentFragment();
            const parts = split === "word" ? text.split(/(?<=\s)|(?=\s)/) : [...text];

            for (const part of parts) {
                const isSpace = part === " ";
                if (isSpace && !wrapSpaces) {
                    frag.appendChild(document.createTextNode(spaceChar || part));
                    continue;
                }
                if (!part.length) continue;

                const el = document.createElement(tagName);
                if (className) el.className = className;
                el.textContent = isSpace ? (spaceChar || part) : part;
                frag.appendChild(el);
            }

            return frag;

        }


    }


}

export default WrapChars;