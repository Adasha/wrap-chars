/**
 * WrapChars Class - wrap inline letters/words in HTML elements.
 * @class WrapChars
 * @version 2.4.0a1
 * @author Adam Shailer <adasha76@outlook.com>
*/

// unpermitted tags: void for nonsensical usage, disallowed for security risks
const VOID_ELEMENTS = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
const DISALLOWED_TAGS    = new Set(["script","style","iframe","object","embed"]);

// never go deep on these tags:
const SKIP_DESCEND_TAGS = new Set(["script", "style", "textarea", "noscript", "template"]);

const VALID_SPLIT_MODES = new Set(["letter", "word"]);


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
        if (!(element instanceof Element))
        {
            throw new TypeError("WrapChars.wrap: element must be a DOM Element");
        }


        // validate tag name
        const tagName = String(params.tagName || "span").toLowerCase();

        if(VOID_ELEMENTS.has(tagName) || DISALLOWED_TAGS.has(tagName))
        {
            throw new Error(`WrapChars: invalid tagName "${tagName}"`);
        }


        const split = params.split || params.type || "letter";
         if (!VALID_SPLIT_MODES.has(split))
        {
            console.warn(`WrapChars: unrecognised split mode "${split}", falling back to "letter"`);
        }


        const config = {
            split: VALID_SPLIT_MODES.has(split) ? split : "letter",
            tagName,
            className: params.className,
            spaceChar: WrapChars.#sanitiseSpaceChar(params.spaceChar),
            deep: Object.hasOwn(params, "deep") ? params.deep : true,
            skipClass: params.skipClass,
            wrapSpaces: Object.hasOwn(params, "wrapSpaces") ? params.wrapSpaces : false,
        };


        WrapChars.#parseNode(element, config);
    }



    /**
     * #sanitiseSpaceChar()
     * Ensures any provided text contains no markup.
     * 
     * @param {string} str 
     * @returns {string|undefined}
     */
    static #sanitiseSpaceChar(str)
    {
        if (!str) return undefined;

        const e = document.createElement("textarea");
        e.innerHTML = str;
        return e.value;
    }


    
    /**
     * #parseNode()
     * Recursively traverse the node tree to isolate and wrap text nodes.
     * 
     * @param {HTMLElement} node - The node to process.
     * @param {Object} config - Passed parameters.
     */
    static #parseNode(node, config)
    {
        switch(node.nodeType)
        {
            case Node.ELEMENT_NODE : //element
                const tag = node.tagName.toLowerCase();

                // Don't parse script/style/textarea/etc
                if (SKIP_DESCEND_TAGS.has(tag)) break;

                if(config.skipClass && node.classList.contains(config.skipClass)) break; // ignore this node

                const children = node.childNodes;
                for(let i=children.length; i>0; i--)
                {
                    const child = children[i-1];
                    if(config.deep || child.nodeType === Node.TEXT_NODE)
                    {
                        WrapChars.#parseNode(child, config);
                    }
                }

                break;

            case Node.TEXT_NODE : //text
                let text = node.textContent;
                if (!text.trim().length) break; //node only contains whitespace

                text = text.replace(/\s\s+/g, " ");
                node.replaceWith( WrapChars.#wrap(text, config) );

                break;

            default:
                //unsupported node type
                break;

        }

    }


    /**
     * #wrap()
     * Private method for constructing output.
     * 
     * @param {string} text - The text to wrap.
     * @param {Object} config
     * @returns {DocumentFragment} The processed HTML string.
     */
    static #wrap(text, config)
    {
        const frag = document.createDocumentFragment();
        const parts = config.split === "word" 
            ? text.split(/(?<=\s)|(?=\s)/) 
            : [...text];

        for (const part of parts) {
            if (!part.length) continue;

            // const isSpace = part === " ";
            const isSpace = /^\s$/.test(part);

            if (isSpace && !config.wrapSpaces)
            {
                frag.appendChild(document.createTextNode(config.spaceChar || part));
                continue;
            }

            const el = document.createElement(config.tagName);
            if (config.className) el.className = config.className;
            el.textContent = isSpace ? (config.spaceChar || part) : part;
            frag.appendChild(el);
        }

        return frag;

    }


}

export default WrapChars;
export { WrapChars };
