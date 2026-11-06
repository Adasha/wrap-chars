// Test cases for the manual test suite page (testsuite.html), which also run
// automatically under Vitest (testsuite.test.js).
//
// Each case has:
//   id        unique slug, used for anchors
//   title     short heading
//   note      (optional) what the case is checking, or what to look for by eye
//   html      markup placed inside the sample; or
//   lines     an array of markup strings, each rendered as its own line
//   force     (optional) WrapChars options that override the control panel
//   rootClass (optional) class added to the sample element itself; the whole
//             sample must then come out unchanged
//   untouched (optional) selector for elements that must come out unchanged
//
// Whitespace in `html` and `lines` is significant: it is what's being tested.

export const GROUPS = [

    {
        id: "whitespace",
        title: "Whitespace",
        cases: [
            {
                id: "edge-whitespace",
                title: "Edges and internal runs",
                lines: [
                    "A line of raw text, with no children.",
                    "\n    A line of raw text, with whitespace at the start and end.\n",
                    "   A    line    of    raw  \n        text,    with    additional    whitespace  \n            added    throughout.   ",
                ],
            },
            {
                id: "control-whitespace",
                title: "Tab, CR and form feed",
                note: "Each should collapse to a single space, like a plain space.",
                lines: [
                    "A&#9;tab, a&#13;carriage return and a&#12;form feed.",
                ],
            },
            {
                id: "marker-whitespace",
                title: "Whitespace around a single character",
                note: "Spaces at the start, middle and end of a line; useful with “Wrap spaces” and a replacement character.",
                lines: [
                    "* *",
                    " * ",
                    "*  ",
                    "*   *",
                    "*\n    *",
                    "\n    * *\n",
                ],
            },
            {
                id: "empty-elements",
                title: "Empty and whitespace-only elements",
                lines: [
                    "Before<span>   </span>after (whitespace-only span)",
                    "Before <span></span> after (empty span)",
                    "<span> </span>",
                    "",
                ],
            },
        ],
    },

    {
        id: "inline",
        title: "Inline markup",
        cases: [
            {
                id: "element-position",
                title: "Inline element at the start, middle and end",
                lines: [
                    "<em>This emphasised text</em>, at the start of the sentence.",
                    "Line of text, with <em>this emphasised text</em> in the middle.",
                    "A line of text, with <em>this emphasised text at the end.</em>",
                    "<strong>A line of text entirely within a nested element.</strong>",
                ],
            },
            {
                id: "adjacent-siblings",
                title: "Adjacent siblings",
                note: "The space between siblings sits outside either element.",
                lines: [
                    "<span>A line of text, with</span> <span>adjacent nested siblings.</span>",
                    "     <span> A line of text, with </span>   nested siblings   <span> and extra spaces.</span>     ",
                ],
            },
            {
                id: "direct-text",
                title: "Text directly in the root",
                note: "No wrapping paragraph: text nodes and elements are direct children of the sample.",
                html: "Direct text, <b>then an element</b>, then more direct text.",
            },
            {
                id: "deep-nesting",
                title: "Deep nesting",
                lines: [
                    "<em>one <strong>two <u>three <mark>four</mark></u></strong></em>",
                ],
            },
            {
                id: "anchor-line-breaks",
                title: "Anchor with nested spans and line breaks",
                note: "The link must keep its href and remain one link.",
                lines: [
                    `<a href="#anchor-line-breaks" id="test-link" title="Test link">
                        <span>Nested spans in an anchor with code indenting,</span>
                        <br>
                        <span>containing adjacent nested siblings</span>
                        <br>
                        <span>and line breaks.</span>
                    </a>`,
                ],
            },
        ],
    },

    {
        id: "special-spaces",
        title: "Special spaces and invisible characters",
        cases: [
            {
                id: "unicode-spaces",
                title: "Non-breaking and en spaces",
                note: "These are content, not collapsible whitespace: they stay wrapped and are never replaced by the space character.",
                lines: [
                    "This text includes&nbsp;non-breaking&nbsp;spaces and&ensp;en-width&ensp;spaces.",
                    "Keep&nbsp;these&nbsp;words&nbsp;together in word mode, but not these ones.",
                ],
            },
            {
                id: "invisible-characters",
                title: "Zero-width and soft hyphen",
                lines: [
                    "zero&#8203;width space, soft&shy;hyphen, word&#8288;joiner",
                ],
            },
        ],
    },

    {
        id: "punctuation",
        title: "Punctuation",
        note: "Most visible in word mode with “Separate punctuation” on.",
        cases: [
            {
                id: "sentence-punctuation",
                title: "Sentence punctuation",
                lines: [
                    "“Punctuation,” she said—don’t you think?! (Well-known: 3.14…)",
                ],
            },
            {
                id: "leading-trailing-punctuation",
                title: "Leading, trailing and repeated",
                lines: [
                    "“Hello”, (really?!) \"Quoted.\" [bracketed] «guillemets»",
                    "Wait...what?! Is that so?!? ¿Sí? ¡Claro!",
                ],
            },
            {
                id: "dashes",
                title: "Hyphens and dashes",
                lines: [
                    "well-known, em—dash, en–dash, a spaced - hyphen and a spaced — em dash",
                ],
            },
            {
                id: "internal-punctuation",
                title: "Punctuation inside words",
                lines: [
                    "don’t, 3.14, 10,000, e-mail, O’Neill, user@example.com, https://example.com/a?b=c",
                ],
            },
            {
                id: "symbols",
                title: "Symbols",
                lines: [
                    "$5 &amp; 50% off #sale @home + more = 2 × 3 ≈ 6",
                ],
            },
        ],
    },

    {
        id: "unicode",
        title: "Unicode and scripts",
        cases: [
            {
                id: "emoji",
                title: "Emoji sequences",
                note: "Skin tones, ZWJ families, flags and variation selectors should each stay in one piece.",
                lines: [
                    "Emoji 👍🏽 👨‍👩‍👧 🇬🇧 🏳️‍🌈 ❤️ 1️⃣",
                ],
            },
            {
                id: "combining-marks",
                title: "Accents and combining marks",
                lines: [
                    "café, naïve, e&#x301; (e + combining acute), n&#x303; (n + combining tilde)",
                ],
            },
            {
                id: "unspaced-scripts",
                title: "Scripts written without spaces",
                note: "Word mode relies on Intl.Segmenter here; punctuation can be separated without spaces around it.",
                lines: [
                    `<span lang="ja">日本語のテキスト、句読点付き。</span>`,
                    `<span lang="zh">你好，世界！这是一个测试。</span>`,
                    `<span lang="th">สวัสดีชาวโลก</span>`,
                    `<span lang="ko">안녕하세요 세계</span>`,
                ],
            },
            {
                id: "rtl",
                title: "Right-to-left text",
                note: "Order should be unchanged. Splitting into letters breaks Arabic joining, which is expected; word mode keeps it.",
                lines: [
                    `<span dir="rtl" lang="ar">مرحبا بالعالم، كيف حالك؟</span>`,
                    `<span dir="rtl" lang="he">שלום עולם, מה שלומך?</span>`,
                ],
            },
            {
                id: "long-word",
                title: "Long unbroken word",
                note: "Check it wraps within the card rather than overflowing.",
                lines: [
                    "Supercalifragilisticexpialidocious_and_a_very_long_unbroken_string_to_check_wrapping",
                ],
            },
        ],
    },

    {
        id: "scope",
        title: "Scope: skipping and descending",
        cases: [
            {
                id: "skip-class",
                title: "skipClass",
                note: "Elements with the class “skip_me” (and everything inside them) stay as they were.",
                force: { skipClass: "skip_me" },
                untouched: ".skip_me",
                lines: [
                    `Wrapped text, <span class="skip_me">skipped text</span>, wrapped again.`,
                    `Wrapped, <span class="skip_me">skipped, with <em>skipped nested</em> text</span>, wrapped.`,
                ],
            },
            {
                id: "skip-root",
                title: "skipClass on the root",
                note: "The whole sample carries the skip class, so nothing is wrapped.",
                force: { skipClass: "skip_me" },
                rootClass: "skip_me",
                lines: [
                    "Nothing in here should be wrapped, <em>including this</em>.",
                ],
            },
            {
                id: "shallow",
                title: "deep: false",
                note: "Only direct text is wrapped; the nested emphasis is left alone.",
                force: { deep: false },
                untouched: "em",
                lines: [
                    "Direct text, <em>nested and untouched</em>, more direct text.",
                ],
            },
            {
                id: "never-descend",
                title: "Elements whose content is never wrapped",
                note: "script, style, textarea and template contents stay as they were (only the textarea is visible). Comments are kept.",
                untouched: "script, style, textarea, template",
                html: `<p>Text before.</p>
                    <!-- a comment -->
                    <script>/* not run */</script>
                    <style>.never-matches { color: red; }</style>
                    <textarea rows="2" cols="30">Textarea content stays editable text.</textarea>
                    <template><p>Template content</p></template>
                    <p>Text after.</p>`,
            },
            {
                id: "preformatted",
                title: "Preformatted text",
                note: "Anything the browser renders with preserved whitespace (<pre>, white-space: pre-wrap or pre-line) is left as it was, including nested elements such as <code>. Ordinary inline <code> is still wrapped.",
                untouched: ".keep",
                html: `<p>Wrapped text with <code>inline code</code> in it.</p>
<pre class="keep">function  indented()
{
    return   "spacing is kept";
}</pre>
<pre class="keep"><code>nested   code
    stays   put</code></pre>
<div class="keep" style="white-space: pre-wrap">pre-wrap   keeps
    spaces and breaks</div>
<div class="keep" style="white-space: pre-line">pre-line   keeps
    its line breaks</div>
<p>Wrapped text after.</p>`,
            },
            {
                id: "existing-markup",
                title: "Existing attributes and elements",
                note: "IDs, classes, titles and hrefs survive, and the link stays a single link.",
                lines: [
                    `A <a href="#existing-markup" id="existing-link" class="link" title="A link" data-x="1">link with attributes</a>, an <abbr title="abbreviation">abbr.</abbr> and <code class="code">inline code</code>.`,
                ],
            },
            {
                id: "markup-like-text",
                title: "Markup-like text",
                note: "Escaped markup must stay as visible text and never become elements.",
                lines: [
                    "&lt;b&gt;not bold&lt;/b&gt; &amp; &lt;script&gt;alert(1)&lt;/script&gt; &lt;img src=x onerror=alert(1)&gt;",
                ],
            },
        ],
    },

    {
        id: "accessibility",
        title: "Accessibility",
        note: "Inspect the accessibility tree or use a screen reader: each heading, link and button should read as normal text.",
        cases: [
            {
                id: "semantic-elements",
                title: "Headings, links and buttons",
                html: `<h3>A wrapped heading</h3>
                    <p>A paragraph with a <a href="#semantic-elements">wrapped link</a> inside.</p>
                    <p><button type="button">Wrapped button label</button></p>`,
            },
        ],
    },

];
