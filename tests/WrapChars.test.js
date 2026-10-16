import { describe, it, expect, vi, afterEach } from "vitest";
import WrapChars, { WrapChars as NamedWrapChars } from "../src/WrapChars.js";


// Most tests are about how text is split, so the helpers turn off the
// accessibility markup and wrapHTML drops data-wrapchars markers (both
// tested separately) to keep expectations readable.

/** Build a <div> from `html`, wrap it, and return the resulting markup. */
function wrapHTML(html, params)
{
    const el = document.createElement("div");
    el.innerHTML = html;
    WrapChars.wrap(el, { accessible: false, ...params });
    for (const marked of el.querySelectorAll("[data-wrapchars]")) marked.removeAttribute("data-wrapchars");
    return el.innerHTML;
}


/** Run `fn` as if Intl.Segmenter were unsupported (e.g. Firefox < 125). */
function withoutSegmenter(fn)
{
    const original = Intl.Segmenter;
    Intl.Segmenter = undefined;
    try { return fn(); }
    finally { Intl.Segmenter = original; }
}


/** Summarise wrapped output as "[class:text]" pieces and quoted text nodes. */
function pieces(text, params)
{
    const el = document.createElement("div");
    el.textContent = text;
    WrapChars.wrap(el, { accessible: false, ...params });
    return [...el.childNodes]
        .map(n => n.nodeType === Node.TEXT_NODE ? JSON.stringify(n.data) : `[${n.className}:${n.textContent}]`)
        .join("");
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
    it("replaces spaces with spaceChar, in an unclassed span", () =>
    {
        expect(wrapHTML("a b", { spaceChar: "_", className: "c" }))
            .toBe('<span class="c">a</span><span>_</span><span class="c">b</span>');
    });

    it("decodes HTML entities in spaceChar", () =>
    {
        const el = document.createElement("div");
        el.textContent = "a b";
        WrapChars.wrap(el, { spaceChar: "&nbsp;", accessible: false });
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
            .toBe("<span>a</span><span>&nbsp;</span><span>b</span><span>_</span><span>c</span>");
    });
});


describe("unicode", () =>
{
    it.each([
        ["emoji with skin-tone modifier", "👍🏽"],
        ["combining accent", "e\u0301"],
        ["ZWJ family emoji", "👨‍👩‍👧"],
        ["flag", "🇬🇧"],
        ["surrogate pair", "𝒜"],
    ])("keeps a %s together as one letter", (_, char) =>
    {
        expect(wrapHTML(char)).toBe(`<span>${char}</span>`);
    });

    it("falls back to code points without Intl.Segmenter", () =>
    {
        withoutSegmenter(() =>
        {
            expect(wrapHTML("👍🏽")).toBe("<span>👍</span><span>🏽</span>");
            expect(wrapHTML("𝒜")).toBe("<span>𝒜</span>");
        });
    });
});


describe("separatePunctuation", () =>
{
    const params = { split: "word", className: "w", separatePunctuation: true };

    it("is off by default", () =>
    {
        expect(pieces("Hello, world!", { split: "word", className: "w" }))
            .toBe('[w:Hello,]" "[w:world!]');
    });

    it("splits punctuation into pieces with the same class as words by default", () =>
    {
        expect(pieces("Hello, world!", params)).toBe('[w:Hello][w:,]" "[w:world][w:!]');
    });

    it("uses punctuationClass for punctuation pieces", () =>
    {
        expect(pieces("Hello, world!", { ...params, punctuationClass: "p" }))
            .toBe('[w:Hello][p:,]" "[w:world][p:!]');
    });

    it("splits leading punctuation and groups runs of punctuation", () =>
    {
        const p = { ...params, punctuationClass: "p" };
        expect(pieces("(hi) wait... what?!", p))
            .toBe('[p:(][w:hi][p:)]" "[w:wait][p:...]" "[w:what][p:?!]');
        expect(pieces("¿Qué? «oui»", p)).toBe('[p:¿][w:Qué][p:?]" "[p:«][w:oui][p:»]');
    });

    it("keeps word-internal punctuation", () =>
    {
        expect(pieces("don't it’s 3.14 well-known", params))
            .toBe('[w:don\'t]" "[w:it’s]" "[w:3.14]" "[w:well-known]');
    });

    it("splits dashes between words", () =>
    {
        expect(pieces("a—b", { ...params, punctuationClass: "p" })).toBe("[w:a][p:—][w:b]");
    });

    it("keeps symbols, emoji and non-breaking spaces with the word", () =>
    {
        expect(pieces("$5 hi👍 non\u00A0breaking", params))
            .toBe('[w:$5]" "[w:hi👍]" "[w:non\u00A0breaking]');
    });

    it("splits punctuation in unspaced scripts", () =>
    {
        expect(pieces("你好，世界。", { ...params, punctuationClass: "p" }))
            .toBe("[w:你好][p:，][w:世界][p:。]");
    });

    it("works with wrapSpaces and spaceChar", () =>
    {
        expect(pieces("a, b", { ...params, wrapSpaces: true, spaceChar: "_" }))
            .toBe("[w:a][w:,][w:_][w:b]");
    });

    it("has no effect in letter mode", () =>
    {
        expect(pieces("a,", { className: "w", separatePunctuation: true, punctuationClass: "p" }))
            .toBe("[w:a][w:,]");
    });

    it("splits only leading and trailing punctuation without Intl.Segmenter", () =>
    {
        withoutSegmenter(() =>
        {
            expect(pieces("(hi) don't a—b", { ...params, punctuationClass: "p" }))
                .toBe('[p:(][w:hi][p:)]" "[w:don\'t]" "[w:a—b]');
        });
    });
});


describe("markers", () =>
{
    const markers = (text, params) =>
    {
        const el = document.createElement("div");
        el.textContent = text;
        WrapChars.wrap(el, params);
        return [...el.children].map(c => c.getAttribute("data-wrapchars"));
    };

    it("marks pieces, the screen-reader copy and wrapped spaces", () =>
    {
        expect(markers("a b", { wrapSpaces: true })).toEqual(["text", "piece", "space", "piece"]);
    });

    it("marks punctuation pieces as pieces", () =>
    {
        expect(markers("a,", { split: "word", separatePunctuation: true, punctuationClass: "p", accessible: false }))
            .toEqual(["piece", "piece"]);
    });

    it("marks an unwrapped spaceChar as a space", () =>
    {
        expect(markers("a b", { spaceChar: "_", accessible: false })).toEqual(["piece", "space", "piece"]);
    });
});


describe("repeat calls", () =>
{
    it.each([
        { accessible: false },
        { accessible: true },
        { split: "word", wrapSpaces: true, spaceChar: "_" },
        { split: "word", separatePunctuation: true },
    ])("leave existing output unchanged with %j", (params) =>
    {
        const el = document.createElement("div");
        el.innerHTML = "Hi, <em>you</em> there";
        WrapChars.wrap(el, params);
        const once = el.innerHTML;
        WrapChars.wrap(el, params);
        expect(el.innerHTML).toBe(once);
    });

    it("wrap text added since the last call", () =>
    {
        const el = document.createElement("div");
        el.textContent = "a";
        WrapChars.wrap(el, { accessible: false });
        el.append("b");
        WrapChars.wrap(el, { accessible: false });
        expect([...el.children].map(c => c.textContent)).toEqual(["a", "b"]);
    });
});


describe("unwrap", () =>
{
    /** Wrap then unwrap `html`, returning the container. */
    function roundTrip(html, params)
    {
        const el = document.createElement("div");
        el.innerHTML = html;
        WrapChars.wrap(el, params);
        WrapChars.unwrap(el);
        return el;
    }

    it.each([
        {},
        { accessible: false },
        { split: "word" },
        { split: "word", separatePunctuation: true, punctuationClass: "p" },
        { wrapSpaces: true },
        { spaceChar: "&nbsp;" },
        { spaceChar: "•", wrapSpaces: true, split: "word" },
        { tagName: "b", className: "c" },
    ])("restores the original markup after wrapping with %j", (params) =>
    {
        const html = 'Hello, <a href="#">dear <em>world</em></a>! 👍🏽 non&nbsp;breaking<!--c-->';
        expect(roundTrip(html, params).innerHTML).toBe(html);
    });

    it("leaves a single text node per original text node", () =>
    {
        const el = roundTrip("a b <b>c</b>");
        expect([...el.childNodes].map(n => n.nodeType)).toEqual([Node.TEXT_NODE, Node.ELEMENT_NODE]);
        expect(el.querySelector("b").childNodes).toHaveLength(1);
    });

    it("keeps whitespace collapsed as wrap() left it", () =>
    {
        expect(roundTrip("a \n\t b").innerHTML).toBe("a b");
    });

    it("leaves elements it didn't create alone", () =>
    {
        const el = document.createElement("div");
        el.textContent = "a";
        WrapChars.wrap(el);
        el.append(document.createElement("span"));
        WrapChars.unwrap(el);
        expect(el.innerHTML).toBe("a<span></span>");
    });

    it("keeps markup-like text as text", () =>
    {
        const el = roundTrip("&lt;img src=x&gt;", { split: "word" });
        expect(el.querySelector("img")).toBeNull();
        expect(el.textContent).toBe("<img src=x>");
    });

    it("allows wrapping again afterwards", () =>
    {
        const el = roundTrip("ab");
        WrapChars.wrap(el, { accessible: false });
        expect(el.children).toHaveLength(2);
    });

    it("does nothing on unwrapped content", () =>
    {
        expect(roundTrip("<p>a</p>", { skipClass: "x" }).innerHTML).toBe("<p>a</p>");
        const el = document.createElement("div");
        el.innerHTML = "<p>a</p>";
        WrapChars.unwrap(el);
        expect(el.innerHTML).toBe("<p>a</p>");
    });

    it.each([null, undefined, "div", document.createTextNode("x")])(
        "throws TypeError for non-Element %s",
        (value) => expect(() => WrapChars.unwrap(value)).toThrow(TypeError),
    );
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
        const a = document.createElement("div");
        const b = document.createElement("div");
        a.textContent = b.textContent = "a";
        WrapChars.wrap(a, null);
        WrapChars.wrap(b);
        expect(a.innerHTML).toBe(b.innerHTML);
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
        WrapChars.wrap(el, { split: "word", accessible: false });
        expect(el.querySelector("img")).toBeNull();
        expect(el.textContent).toBe("<img src=x onerror=alert(1)>");
    });

    it("treats markup in spaceChar as text", () =>
    {
        const el = document.createElement("div");
        el.textContent = "a b";
        WrapChars.wrap(el, { spaceChar: "<img src=x onerror=alert(1)>", accessible: false });
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
        WrapChars.wrap(el, { className: '" onclick="alert(1)', accessible: false });
        const span = el.firstElementChild;
        expect(span.hasAttribute("onclick")).toBe(false);
        expect(span.getAttribute("class")).toBe('" onclick="alert(1)');
    });
});


describe("accessible", () =>
{
    /** Wrap `html` with defaults (accessible on) and return the container. */
    function wrapAccessible(html, params)
    {
        const el = document.createElement("div");
        el.innerHTML = html;
        WrapChars.wrap(el, params);
        return el;
    }

    const hiddenCopies = el => [...el.querySelectorAll("span:not([aria-hidden])")];
    const isVisuallyHidden = span =>
        span.style.position === "absolute" && span.style.clipPath === "inset(50%)"
        && span.style.userSelect === "none";

    it("is on by default", () =>
    {
        const el = wrapAccessible("ab");
        expect(hiddenCopies(el)).toHaveLength(1);
    });

    it("adds a visually hidden copy of the text before the pieces", () =>
    {
        const el = wrapAccessible("ab c");
        const copy = el.firstChild;
        expect(copy.textContent).toBe("ab c");
        expect(isVisuallyHidden(copy)).toBe(true);
        expect(copy.hasAttribute("aria-hidden")).toBe(false);
    });

    it("styles the copy without a style attribute in markup (CSP-safe)", () =>
    {
        const setAttribute = vi.spyOn(Element.prototype, "setAttribute");
        wrapAccessible("a");
        expect(setAttribute.mock.calls.map(([name]) => name)).not.toContain("style");
    });

    it("hides every piece, including wrapped spaces and punctuation", () =>
    {
        const el = wrapAccessible("a, b", {
            split: "word", separatePunctuation: true, punctuationClass: "p", wrapSpaces: true,
        });
        const pieces = [...el.children].slice(1);
        expect(pieces.map(p => p.textContent)).toEqual(["a", ",", " ", "b"]);
        for (const piece of pieces) expect(piece.getAttribute("aria-hidden")).toBe("true");
    });

    it("hides a decorative spaceChar", () =>
    {
        const el = wrapAccessible("a b", { spaceChar: "•" });
        const bullet = [...el.children].find(c => c.textContent === "•");
        expect(bullet.tagName).toBe("SPAN");
        expect(bullet.getAttribute("aria-hidden")).toBe("true");
        expect(bullet.className).toBe("");
    });

    it("leaves plain spaces as text", () =>
    {
        const el = wrapAccessible("a b");
        const text = [...el.childNodes].filter(n => n.nodeType === Node.TEXT_NODE);
        expect(text.map(n => n.data)).toEqual([" "]);
    });

    it("adds one copy per text node, preserving nested semantics", () =>
    {
        const el = wrapAccessible('Go <a href="#">home</a> now');
        expect(hiddenCopies(el).map(c => c.textContent)).toEqual(["Go ", "home", " now"]);
        expect(el.querySelector("a").firstChild.textContent).toBe("home");
    });

    it("uses the original text in the copy, with whitespace collapsed", () =>
    {
        const el = wrapAccessible("a \n  b", { spaceChar: "_" });
        expect(el.firstChild.textContent).toBe("a b");
    });

    it("keeps markup in the copy as text", () =>
    {
        const el = wrapAccessible("&lt;img src=x&gt;");
        expect(el.querySelector("img")).toBeNull();
        expect(el.firstChild.textContent).toBe("<img src=x>");
    });

    it("adds no accessibility markup with accessible: false", () =>
    {
        const el = wrapAccessible("a b", { accessible: false, spaceChar: "•" });
        expect(el.innerHTML).toBe(
            '<span data-wrapchars="piece">a</span><span data-wrapchars="space">•</span><span data-wrapchars="piece">b</span>',
        );
    });
});
