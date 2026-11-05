// Shared by the test suite page (testsuite.html) and its automated run
// (testsuite.test.js): renders a case, wraps it, and checks invariants that
// should hold for any combination of options.

import WrapChars from "../src/WrapChars.js";


/** The control panel's initial values, as WrapChars options. */
export const DEFAULTS = {
    split: "letter",
    tagName: "span",
    className: "test_class",
    skipClass: "",
    spaceChar: "",
    deep: true,
    wrapSpaces: false,
    separatePunctuation: false,
    punctuationClass: "test_punct",
    accessible: true,
};


/** Named option sets: each is applied over DEFAULTS. */
export const PRESETS = {
    "Defaults": {},
    "Words": { split: "word" },
    "Words + punctuation": { split: "word", separatePunctuation: true },
    "Wrapped spaces": { split: "word", wrapSpaces: true },
    "Visible spaces": { split: "word", wrapSpaces: true, spaceChar: "·" },
    "Letters, visible spaces": { wrapSpaces: true, spaceChar: "·" },
    "No accessibility markup": { accessible: false },
    "Shallow": { deep: false },
};


// HTML's whitespace, as collapsed by browsers (non-breaking spaces excluded).
const normalise = text => text.replace(/[ \t\n\f\r]+/g, " ").trim();


/** Put a case's markup into `sample`, replacing whatever was there. */
export function renderCase(sample, testCase)
{
    sample.className = "sample";
    if (testCase.rootClass) sample.classList.add(testCase.rootClass);

    sample.innerHTML = testCase.lines
        ? testCase.lines.map(line => `<p class="line">${line}</p>`).join("\n")
        : testCase.html;
}


/** Count comment nodes beneath `root`. */
function countComments(root)
{
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
    let count = 0;
    while (walker.nextNode()) count++;
    return count;
}


/** The text a reader would see: the wrapped content with spaces restored and screen-reader copies dropped. */
function visibleText(root)
{
    const copy = root.cloneNode(true);
    for (const el of copy.querySelectorAll('[data-wrapchars="text"]')) el.remove();
    for (const el of copy.querySelectorAll('[data-wrapchars="space"]')) el.replaceWith(" ");
    return normalise(copy.textContent);
}


/**
 * Render `testCase` into `sample`, wrap it with `params` (plus the case's own
 * overrides), and check it.
 *
 * @returns {{ name: string, ok: boolean, detail?: string }[]}
 * @throws whatever WrapChars.wrap throws, e.g. for an invalid tag name.
 */
export function runCase(sample, testCase, params)
{
    renderCase(sample, testCase);

    const options = { ...params, ...testCase.force };
    const expectedText = normalise(sample.textContent);
    const commentCount = countComments(sample);

    const untouched = testCase.untouched
        ? [...sample.querySelectorAll(testCase.untouched)].map(el => [el, el.outerHTML])
        : [];
    const rootHTML = sample.innerHTML;
    const attributes = [...sample.querySelectorAll("*")].map(el => [el, el.cloneNode(false).outerHTML]);

    WrapChars.wrap(sample, options);

    const wrapped = sample.innerHTML;
    const marked = [...sample.querySelectorAll("[data-wrapchars]")];
    const results = [];
    const check = (name, ok, detail) => results.push({ name, ok, detail: ok ? undefined : detail });


    const actualText = visibleText(sample);
    check("Text preserved", actualText === expectedText,
        `expected ${JSON.stringify(expectedText)}, got ${JSON.stringify(actualText)}`);

    const added = [...sample.querySelectorAll("*")].filter(el => !el.hasAttribute("data-wrapchars"));
    const unexpected = added.filter(el => !attributes.some(([original]) => original === el));
    check("Only wrapper elements added", unexpected.length === 0,
        `unexpected: ${unexpected.map(el => el.outerHTML).join(", ")}`);

    const changed = attributes.filter(([el, html]) => el.cloneNode(false).outerHTML !== html);
    check("Existing elements keep their attributes", changed.length === 0,
        `changed: ${changed.map(([el]) => el.tagName).join(", ")}`);

    check("Comments preserved", countComments(sample) === commentCount, "comment count changed");

    if (testCase.rootClass)
    {
        check("Skipped root left unchanged", sample.innerHTML === rootHTML, "root content changed");
    }
    if (testCase.untouched)
    {
        const altered = untouched.filter(([el, html]) => el.outerHTML !== html);
        check("Skipped elements left unchanged", untouched.length > 0 && altered.length === 0,
            untouched.length ? `${altered.length} of ${untouched.length} changed` : "selector matched nothing");
    }

    const pieces = marked.filter(el => el.getAttribute("data-wrapchars") !== "text");
    const copies = marked.filter(el => el.getAttribute("data-wrapchars") === "text");
    if (options.accessible === false)
    {
        check("No accessibility markup", copies.length === 0 && !marked.some(el => el.hasAttribute("aria-hidden")),
            "found screen-reader copies or aria-hidden");
    }
    else
    {
        const exposed = pieces.filter(el => el.getAttribute("aria-hidden") !== "true");
        check("Pieces hidden from screen readers", exposed.length === 0,
            `${exposed.length} piece(s) without aria-hidden`);
        check("Screen-reader copy present", pieces.length === 0 || copies.length > 0, "no copy of the text");
    }

    // Wrapping again must change nothing.
    WrapChars.wrap(sample, options);
    check("Wrapping twice is stable", sample.innerHTML === wrapped, "second wrap altered the output");

    // Unwrapping a copy must give back the text and leave no wrappers.
    const restored = sample.cloneNode(true);
    WrapChars.unwrap(restored);
    check("Unwrap removes all wrappers", !restored.querySelector("[data-wrapchars]"), "markers remain");
    check("Unwrap restores the text", normalise(restored.textContent) === expectedText,
        `got ${JSON.stringify(normalise(restored.textContent))}`);

    return results;
}
