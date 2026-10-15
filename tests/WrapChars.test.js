import { describe, it, expect, vi, afterEach } from "vitest";
import WrapChars, { WrapChars as NamedWrapChars } from "../src/WrapChars.js";


/** Build a <div> from `html`, wrap it, and return the resulting markup. */
function wrapHTML(html, params)
{
    const el = document.createElement("div");
    el.innerHTML = html;
    WrapChars.wrap(el, params);
    return el.innerHTML;
}


afterEach(() => vi.restoreAllMocks());


describe("exports", () =>
{
    it("exposes the class as both default and named export", () =>
    {
        expect(NamedWrapChars).toBe(WrapChars);
        expect(typeof WrapChars.wrap).toBe("function");
    });
});


describe("split", () =>
{
    it("wraps each letter by default, leaving spaces unwrapped", () =>
    {
        expect(wrapHTML("ab c")).toBe("<span>a</span><span>b</span> <span>c</span>");
    });

    it("wraps each word with split: 'word'", () =>
    {
        expect(wrapHTML("ab cd", { split: "word" })).toBe("<span>ab</span> <span>cd</span>");
    });

    it("keeps punctuation attached to words", () =>
    {
        expect(wrapHTML("Hello, world!", { split: "word" })).toBe("<span>Hello,</span> <span>world!</span>");
    });

    it("rejects the removed `type` option with a pointer to `split`", () =>
    {
        expect(() => wrapHTML("ab", { type: "word" })).toThrow(TypeError);
        expect(() => wrapHTML("ab", { type: "word" })).toThrow(/use "split"/);
    });

    it("throws RangeError for an unknown mode", () =>
    {
        expect(() => wrapHTML("ab", { split: "bogus" })).toThrow(RangeError);
    });
});


describe("tagName and className", () =>
{
    it("uses the given tag name, case-insensitively", () =>
    {
        expect(wrapHTML("ab", { tagName: "B" })).toBe("<b>a</b><b>b</b>");
    });

    it("allows custom element names", () =>
    {
        expect(wrapHTML("a", { tagName: "my-el" })).toBe("<my-el>a</my-el>");
    });

    it("applies className to every wrapper", () =>
    {
        expect(wrapHTML("ab", { className: "x y" })).toBe('<span class="x y">a</span><span class="x y">b</span>');
    });

    it("omits the class attribute when className is empty", () =>
    {
        expect(wrapHTML("a", { className: "" })).toBe("<span>a</span>");
    });
});


describe("deep and skipClass", () =>
{
    it("wraps nested text by default", () =>
    {
        expect(wrapHTML("a<b>c</b>")).toBe("<span>a</span><b><span>c</span></b>");
    });

    it("only wraps direct text children with deep: false", () =>
    {
        expect(wrapHTML("a<b>c</b>", { deep: false })).toBe("<span>a</span><b>c</b>");
    });

    it("skips elements with skipClass", () =>
    {
        expect(wrapHTML('a<b class="s">c</b>d', { skipClass: "s" }))
            .toBe('<span>a</span><b class="s">c</b><span>d</span>');
    });

    it("skips skipClass on the root element itself", () =>
    {
        const el = document.createElement("div");
        el.className = "s";
        el.textContent = "ab";
        WrapChars.wrap(el, { skipClass: "s" });
        expect(el.innerHTML).toBe("ab");
    });

    it("never descends into script, style, textarea, noscript or template", () =>
    {
        const html = "<textarea>x</textarea><noscript>x</noscript><template>x</template>";
        expect(wrapHTML(html)).toBe(html);

        // <script>/<style> can't be created via innerHTML on a detached div
        // in a way that executes, but must still be left alone.
        const el = document.createElement("div");
        const script = el.appendChild(document.createElement("script"));
        const style = el.appendChild(document.createElement("style"));
        script.textContent = "var x;";
        style.textContent = "p{}";
        WrapChars.wrap(el);
        expect(script.textContent).toBe("var x;");
        expect(style.textContent).toBe("p{}");
        expect(script.children).toHaveLength(0);
    });

    it("preserves comments and existing markup", () =>
    {
        expect(wrapHTML('<!--c--><a href="#">a</a>')).toBe('<!--c--><a href="#"><span>a</span></a>');
    });
});


describe("whitespace", () =>
{
    it("ignores whitespace-only text nodes", () =>
    {
        expect(wrapHTML("  ")).toBe("  ");
        expect(wrapHTML("<b>a</b> <b>b</b>")).toBe("<b><span>a</span></b> <b><span>b</span></b>");
    });

    it("handles empty elements", () =>
    {
        expect(wrapHTML("")).toBe("");
    });

    it("collapses runs of whitespace to a single space", () =>
    {
        expect(wrapHTML("a \n\t b")).toBe("<span>a</span> <span>b</span>");
    });

    it("normalises a single newline, tab, CR or form feed to a space", () =>
    {
        expect(wrapHTML("a\nb")).toBe("<span>a</span> <span>b</span>");
        expect(wrapHTML("a\tb", { split: "word" })).toBe("<span>a</span> <span>b</span>");
        expect(wrapHTML("a\rb\fc", { split: "word" })).toBe("<span>a</span> <span>b</span> <span>c</span>");
    });

    it("treats non-breaking and other Unicode spaces as content", () =>
    {
        expect(wrapHTML("a&nbsp;b")).toBe("<span>a</span><span>&nbsp;</span><span>b</span>");
        expect(wrapHTML("a\u2002b")).toBe("<span>a</span><span>\u2002</span><span>b</span>");
    });

    it("keeps words joined by a non-breaking space together", () =>
    {
        expect(wrapHTML("non&nbsp;breaking words", { split: "word" }))
            .toBe("<span>non&nbsp;breaking</span> <span>words</span>");
    });

    it("wraps a text node containing only a non-breaking space", () =>
    {
        expect(wrapHTML("<b>&nbsp;</b>")).toBe("<b><span>&nbsp;</span></b>");
    });

    it("wraps spaces with wrapSpaces: true", () =>
    {
        expect(wrapHTML("a b", { wrapSpaces: true })).toBe("<span>a</span><span> </span><span>b</span>");
        expect(wrapHTML("a b", { split: "word", wrapSpaces: true }))
            .toBe("<span>a</span><span> </span><span>b</span>");
    });
});


describe("spaceChar", () =>
{
    it("replaces spaces with spaceChar", () =>
    {
        expect(wrapHTML("a b", { spaceChar: "_" })).toBe("<span>a</span>_<span>b</span>");
    });

    it("decodes HTML entities in spaceChar", () =>
    {
        const el = document.createElement("div");
        el.textContent = "a b";
        WrapChars.wrap(el, { spaceChar: "&nbsp;" });
        expect(el.textContent).toBe("a b");
    });

    it("wraps spaceChar when wrapSpaces is true", () =>
    {
        expect(wrapHTML("a b", { spaceChar: "__", wrapSpaces: true }))
            .toBe("<span>a</span><span>__</span><span>b</span>");
    });

    it("does not replace non-breaking spaces", () =>
    {
        expect(wrapHTML("a&nbsp;b c", { spaceChar: "_" }))
            .toBe("<span>a</span><span>&nbsp;</span><span>b</span>_<span>c</span>");
    });
});


describe("unicode", () =>
{
    // Current behaviour, slated for review: splitting is by code point,
    // which breaks grapheme clusters apart.
    it("[current] splits emoji modifiers and combining marks", () =>
    {
        expect(wrapHTML("👍🏽")).toBe("<span>👍</span><span>🏽</span>");
        expect(wrapHTML("é")).toBe("<span>e</span><span>́</span>");
    });

    it("does not split surrogate pairs", () =>
    {
        expect(wrapHTML("𝒜")).toBe("<span>𝒜</span>");
    });
});


describe("repeat calls", () =>
{
    // Current behaviour, slated for review.
    it("[current] nests wrappers when called twice", () =>
    {
        const el = document.createElement("div");
        el.textContent = "a";
        WrapChars.wrap(el);
        WrapChars.wrap(el);
        expect(el.innerHTML).toBe("<span><span>a</span></span>");
    });
});


describe("validation", () =>
{
    it.each([null, undefined, "div", {}, document.createTextNode("x")])(
        "throws TypeError for non-Element %s",
        (value) => expect(() => WrapChars.wrap(value)).toThrow(TypeError),
    );

    it.each([
        "img", "br", "input", "script", "SCRIPT", "style", "iframe", "object", "embed",
        "template", "textarea", "title", "noscript", "frame", "frameset",
    ])(
        "rejects tagName %s",
        (tagName) => expect(() => wrapHTML("a", { tagName })).toThrow(RangeError),
    );

    it.each(["bad tag", "1a", "<b>", "a>"])(
        "rejects syntactically invalid tagName %j",
        (tagName) => expect(() => wrapHTML("a", { tagName })).toThrow(RangeError),
    );

    it.each([{ tagName: "img" }, { tagName: "bad tag" }, { split: "bogus" }, { type: "word" }])(
        "validates %j before modifying the DOM",
        (params) =>
        {
            const el = document.createElement("div");
            el.innerHTML = "a<b>c</b>";
            expect(() => WrapChars.wrap(el, params)).toThrow();
            expect(el.innerHTML).toBe("a<b>c</b>");
        },
    );

    it("validates tagName even when there is no text to wrap", () =>
    {
        expect(() => wrapHTML("  ", { tagName: "bad tag" })).toThrow(RangeError);
    });

    it("treats null params as defaults", () =>
    {
        const el = document.createElement("div");
        el.textContent = "a";
        WrapChars.wrap(el, null);
        expect(el.innerHTML).toBe("<span>a</span>");
    });

    it("coerces deep and wrapSpaces to booleans", () =>
    {
        expect(wrapHTML("a<b>c</b>", { deep: 0 })).toBe("<span>a</span><b>c</b>");
        expect(wrapHTML("a b", { wrapSpaces: 1 })).toBe("<span>a</span><span> </span><span>b</span>");
    });
});


describe("security", () =>
{
    it("treats escaped markup in page text as text", () =>
    {
        const el = document.createElement("div");
        el.innerHTML = "&lt;img src=x onerror=alert(1)&gt;";
        WrapChars.wrap(el, { split: "word" });
        expect(el.querySelector("img")).toBeNull();
        expect(el.textContent).toBe("<img src=x onerror=alert(1)>");
    });

    it("treats markup in spaceChar as text", () =>
    {
        const el = document.createElement("div");
        el.textContent = "a b";
        WrapChars.wrap(el, { spaceChar: "<img src=x onerror=alert(1)>" });
        expect(el.querySelector("img")).toBeNull();
        expect(el.textContent).toBe("a<img src=x onerror=alert(1)>b");
    });

    it("does not create elements while decoding spaceChar", () =>
    {
        const create = vi.spyOn(document, "createElement");
        const el = document.createElement("div");
        el.textContent = "a b";
        WrapChars.wrap(el, { spaceChar: "<img src=x>" });
        const created = create.mock.results.map(r => r.value.tagName);
        expect(created).not.toContain("IMG");
    });

    it("cannot inject attributes via className", () =>
    {
        const el = document.createElement("div");
        el.textContent = "a";
        WrapChars.wrap(el, { className: '" onclick="alert(1)' });
        const span = el.firstElementChild;
        expect(span.hasAttribute("onclick")).toBe(false);
        expect(span.getAttribute("class")).toBe('" onclick="alert(1)');
    });
});
