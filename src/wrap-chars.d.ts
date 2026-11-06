export interface WrapOptions {
    /** How to divide the text. Default `"letter"`. */
    split?: "letter" | "word";
    /** Element to wrap each piece in. Default `"span"`. */
    tagName?: string;
    /** Class name added to each piece. */
    className?: string;
    /** Also wrap text inside nested elements. Default `true`. */
    deep?: boolean;
    /** Wrap space characters too (including `spaceChar`). Default `false`. */
    wrapSpaces?: boolean;
    /** Skip any element with this class. */
    skipClass?: string;
    /** Replace inline spaces with this string. HTML entities are decoded; markup stays literal. */
    spaceChar?: string;
    /** Word mode only: split punctuation around words into separate pieces. Default `false`. */
    separatePunctuation?: boolean;
    /** Class for punctuation pieces. Defaults to `className`. */
    punctuationClass?: string;
    /** Add a visually hidden copy of each text node and `aria-hidden` on pieces. Default `true`. */
    accessible?: boolean;
}

export class WrapChars {
    /**
     * Wrap the text inside `element` in individual elements.
     * @throws {TypeError} If `element` is not an Element, or the removed `type` option is used.
     * @throws {RangeError} If `tagName` or `split` is not permitted.
     */
    static wrap(element: Element, params?: WrapOptions): void;

    /**
     * Reverse `wrap()`, replacing every element it created with plain text.
     * @throws {TypeError} If `element` is not an Element.
     */
    static unwrap(element: Element): void;
}

export default WrapChars;
