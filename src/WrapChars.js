/**
 * WrapChars Class - wrap inline letters/words in HTML elements.
 * @class WrapChars
 * @version 3.0.0
 * @author Adam Shailer <adasha76@outlook.com>
*/

// unpermitted tags: void for nonsensical usage, disallowed for security risks
// or because their content isn't rendered as ordinary inline text
const VOID_ELEMENTS     = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
const DISALLOWED_TAGS   = new Set(["script","style","iframe","object","embed","template","textarea","title","noscript","frame","frameset"]);

// never go deep on these tags:
const SKIP_DESCEND_TAGS = new Set(["script", "style", "textarea", "noscript", "template"]);

const VALID_SPLIT_MODES = new Set(["letter", "word"]);

// HTML's definition of whitespace (space, tab, LF, FF, CR), as collapsed by
// browsers. Deliberately excludes &nbsp;, &ensp; etc., which are content.
const WHITESPACE_RUN  = /[ \t\n\f\r]+/g;
const WHITESPACE_ONLY = /^[ \t\n\f\r]*$/;
const WORD_SPLIT      = /( )/;


class WrapChars
{

    /**
     * wrap()
     * Wrap inline text characters/words with HTML elements.
     *
     * @param {Element} element - A reference to a DOM element.
     * @param {Object} [params={}] - An object containing key/value pairs used to configure the method.
     * @param {string} [params.split="letter"] - The method by which text will be divided. "letter"|"word".
     * @param {string} [params.tagName="span"] - The name of the element to wrap each character in, defaults to <span>.
     * @param {string} [params.className] - An optional class name to add to each element.
     * @param {boolean} [params.deep=true] - Whether to also wrap the text within nested elements. Default is true.
     * @param {boolean} [params.wrapSpaces=false] - If true, will wrap space characters, including spaceChar if specified.
     * @param {string} [params.skipClass] - If provided, will pass over any elements with that class.
     * @param {string} [params.spaceChar] - An optional string to replace inline spaces with. HTML entities are decoded; any markup is kept as literal text.
     * @throws {TypeError} If element is not an Element, or a removed option is used.
     * @throws {RangeError} If tagName or split is not permitted.
     * @method
     * @static
     */
    static wrap(element, params = {})
    {
        if (!(element instanceof Element))
        {
            throw new TypeError("WrapChars.wrap: element must be a DOM Element");
        }

        params ??= {};

        if (Object.hasOwn(params, "type"))
        {
            throw new TypeError(`WrapChars: the "type" option was removed in v3, use "split" instead`);
        }


        const split = params.split ?? "letter";
        if (!VALID_SPLIT_MODES.has(split))
        {
            throw new RangeError(`WrapChars: invalid split mode "${split}", expected "letter" or "word"`);
        }


        // Validate everything before touching the DOM, so a bad option can't
        // leave the element half-wrapped.
        const config = {
            split,
            template: WrapChars.#createTemplate(params.tagName, params.className),
            spaceChar: WrapChars.#sanitiseSpaceChar(params.spaceChar),
            deep: Boolean(params.deep ?? true),
            skipClass: params.skipClass,
            wrapSpaces: Boolean(params.wrapSpaces),
        };


        WrapChars.#parseNode(element, config);
    }



    /**
     * #createTemplate()
     * Validate the wrapper tag and build an element to clone for each piece.
     *
     * @param {string} [tagName="span"]
     * @param {string} [className]
     * @returns {Element}
     */
    static #createTemplate(tagName, className)
    {
        const tag = String(tagName || "span").toLowerCase();

        if(VOID_ELEMENTS.has(tag) || DISALLOWED_TAGS.has(tag))
        {
            throw new RangeError(`WrapChars: invalid tagName "${tag}"`);
        }

        let template;
        try
        {
            template = document.createElement(tag);
        }
        catch
        {
            throw new RangeError(`WrapChars: invalid tagName "${tag}"`);
        }

        if (className) template.className = String(className);

        return template;
    }



    /**
     * #sanitiseSpaceChar()
     * Decode HTML entities in the provided string. Markup is not parsed: the
     * textarea's RCDATA content model keeps any tags as literal text.
     *
     * @param {string} str
     * @returns {string|undefined}
     */
    static #sanitiseSpaceChar(str)
    {
        if (!str) return undefined;

        const e = document.createElement("textarea");
        e.innerHTML = String(str);
        return e.value;
    }



    /**
     * #parseNode()
     * Recursively traverse the node tree to isolate and wrap text nodes.
     *
     * @param {Node} node - The node to process.
     * @param {Object} config - Validated parameters.
     */
    static #parseNode(node, config)
    {
        switch(node.nodeType)
        {
            case Node.ELEMENT_NODE : //element
            {
                const tag = node.tagName.toLowerCase();

                // Don't parse script/style/textarea/etc
                if (SKIP_DESCEND_TAGS.has(tag)) break;

                if(config.skipClass && node.classList.contains(config.skipClass)) break; // ignore this node

                // Iterate backwards: replacing a text node with several nodes
                // shifts the indices of every following sibling.
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
            }

            case Node.TEXT_NODE : //text
            {
                if (WHITESPACE_ONLY.test(node.data)) break; //node only contains whitespace

                const text = node.data.replace(WHITESPACE_RUN, " ");
                node.replaceWith( WrapChars.#wrap(text, config) );

                break;
            }

            default:
                //unsupported node type
                break;

        }

    }


    /**
     * #wrap()
     * Private method for constructing output.
     *
     * @param {string} text - The text to wrap, with whitespace already collapsed to single spaces.
     * @param {Object} config
     * @returns {DocumentFragment} The wrapped content.
     */
    static #wrap(text, config)
    {
        const frag = document.createDocumentFragment();
        const parts = config.split === "word"
            ? text.split(WORD_SPLIT)
            : [...text];

        for (const part of parts)
        {
            if (!part.length) continue;

            const isSpace = part === " ";
            const content = isSpace && config.spaceChar ? config.spaceChar : part;

            if (isSpace && !config.wrapSpaces)
            {
                frag.appendChild(document.createTextNode(content));
                continue;
            }

            const el = config.template.cloneNode(false);
            el.textContent = content;
            frag.appendChild(el);
        }

        return frag;

    }


}

export default WrapChars;
export { WrapChars };
