import WrapChars from "../src/WrapChars.js";
import { GROUPS } from "./testsuite-cases.js";
import { DEFAULTS, PRESETS, renderCase, runCase } from "./testsuite-lib.js";


const form      = document.getElementById("options");
const container = document.getElementById("cases");
const nav       = document.getElementById("group_nav");
const summary   = document.getElementById("summary");
const outError  = document.getElementById("out_error");
const selPreset = document.getElementById("sel_preset");
const cbOutline = document.getElementById("cb_outline");

// Option name → [control id, element property].
const FIELDS = {
    split:               ["sel_split", "value"],
    tagName:             ["txt_tag", "value"],
    className:           ["txt_class", "value"],
    skipClass:           ["txt_skip", "value"],
    spaceChar:           ["txt_space", "value"],
    deep:                ["cb_deep", "checked"],
    wrapSpaces:          ["cb_spaces", "checked"],
    separatePunctuation: ["cb_punct", "checked"],
    punctuationClass:    ["txt_punct", "value"],
    accessible:          ["cb_a11y", "checked"],
};

const controls = Object.fromEntries(
    Object.entries(FIELDS).map(([name, [id, prop]]) => [name, { el: document.getElementById(id), prop }])
);


/* ---- Options <-> controls <-> URL hash ---- */

function readParams()
{
    return Object.fromEntries(
        Object.entries(controls).map(([name, { el, prop }]) => [name, el[prop]])
    );
}

function setParams(params)
{
    for (const [name, { el, prop }] of Object.entries(controls))
    {
        if (name in params) el[prop] = params[name];
    }
}

function writeHash()
{
    const state = new URLSearchParams();
    const params = readParams();
    for (const [name, value] of Object.entries(params))
    {
        if (value !== DEFAULTS[name]) state.set(name, typeof value === "boolean" ? (value ? "1" : "0") : value);
    }
    if (cbOutline.checked) state.set("outline", "1");

    const hash = state.toString();
    history.replaceState(null, "", hash ? `#${hash}` : location.pathname + location.search);
}

function readHash()
{
    const state = new URLSearchParams(location.hash.slice(1));
    const params = {};
    for (const name of Object.keys(controls))
    {
        if (!state.has(name)) continue;
        params[name] = typeof DEFAULTS[name] === "boolean" ? state.get(name) === "1" : state.get(name);
    }
    setParams({ ...DEFAULTS, ...params });
    cbOutline.checked = state.get("outline") === "1";
}


/* ---- Building the page ---- */

const cards = [];

function buildCases()
{
    for (const group of GROUPS)
    {
        const section = document.createElement("section");
        section.className = "group";
        section.id = group.id;
        section.innerHTML = `<h2></h2><p class="group-note"></p><div class="grid"></div>`;
        section.querySelector("h2").textContent = group.title;
        const note = section.querySelector(".group-note");
        if (group.note) note.textContent = group.note; else note.remove();

        const link = document.createElement("a");
        link.href = `#${group.id}`;
        link.textContent = group.title;
        const item = document.createElement("li");
        item.append(link);
        nav.append(item);

        for (const testCase of group.cases)
        {
            const card = document.createElement("article");
            card.className = "case";
            card.id = testCase.id;
            card.innerHTML = `
                <header>
                    <h3></h3>
                    <span class="status" data-state="idle">–</span>
                </header>
                <p class="note"></p>
                <p class="forced"></p>
                <div class="sample"></div>
                <ul class="checks"></ul>
                <details><summary>Result HTML</summary><pre></pre></details>`;
            card.querySelector("h3").textContent = testCase.title;

            const note = card.querySelector(".note");
            if (testCase.note) note.textContent = testCase.note; else note.remove();

            const forced = card.querySelector(".forced");
            if (testCase.force)
            {
                forced.textContent = "Overrides: " + Object.entries(testCase.force)
                    .map(([name, value]) => `${name}: ${JSON.stringify(value)}`).join(", ");
            }
            else forced.remove();

            const sample = card.querySelector(".sample");
            renderCase(sample, testCase);

            section.querySelector(".grid").append(card);
            cards.push({ testCase, card, sample });
        }

        container.append(section);
    }
}


/* ---- Running ---- */

function setStatus({ card }, state, text)
{
    const status = card.querySelector(".status");
    status.dataset.state = state;
    status.textContent = text;
}

function showChecks({ card }, results)
{
    const list = card.querySelector(".checks");
    list.replaceChildren(...results.map(result =>
    {
        const item = document.createElement("li");
        item.dataset.ok = String(result.ok);
        item.textContent = result.ok ? result.name : `${result.name}: ${result.detail}`;
        return item;
    }));
}

function showMarkup({ card, sample })
{
    card.querySelector("pre").textContent = sample.innerHTML.replace(/></g, ">\n<");
}

function updateSummary(passed, failed)
{
    summary.dataset.state = failed ? "fail" : "pass";
    summary.textContent = failed
        ? `${failed} of ${passed + failed} cases failing`
        : `All ${passed} cases pass`;
}

function applyAll()
{
    const params = readParams();
    outError.value = "";
    container.classList.toggle("show-pieces", cbOutline.checked);

    let passed = 0, failed = 0;
    try
    {
        for (const entry of cards)
        {
            const results = runCase(entry.sample, entry.testCase, params);
            const ok = results.every(result => result.ok);
            setStatus(entry, ok ? "pass" : "fail", ok ? "Pass" : "Fail");
            showChecks(entry, results);
            showMarkup(entry);
            if (ok) passed++; else failed++;
        }
        updateSummary(passed, failed);
    }
    catch (err)
    {
        // An invalid option (e.g. a bad tag name): put the samples back and say why.
        outError.value = err.message;
        for (const entry of cards)
        {
            renderCase(entry.sample, entry.testCase);
            setStatus(entry, "idle", "–");
            showChecks(entry, []);
            showMarkup(entry);
        }
        summary.dataset.state = "idle";
        summary.textContent = "Options are invalid";
    }

    writeHash();
}

function unwrapAll()
{
    for (const entry of cards)
    {
        WrapChars.unwrap(entry.sample);
        setStatus(entry, "idle", "Unwrapped");
        showChecks(entry, []);
        showMarkup(entry);
    }
    summary.dataset.state = "idle";
    summary.textContent = "Unwrapped";
}


/* ---- Wiring ---- */

for (const name of Object.keys(PRESETS))
{
    selPreset.append(new Option(name, name));
}
selPreset.append(new Option("Custom", "", true, true));

selPreset.addEventListener("change", () =>
{
    if (!selPreset.value) return;
    setParams({ ...DEFAULTS, ...PRESETS[selPreset.value] });
    applyAll();
});

let timer;
form.addEventListener("input", (e) =>
{
    if (e.target === selPreset || e.target === cbOutline) return;
    clearTimeout(timer);
    timer = setTimeout(() => { syncPreset(); applyAll(); }, 150);
});

cbOutline.addEventListener("input", applyAll);
document.getElementById("btn_apply").addEventListener("click", applyAll);
document.getElementById("btn_unwrap").addEventListener("click", unwrapAll);

/** Select the preset matching the current controls, or "Custom". */
function syncPreset()
{
    const params = readParams();
    const match = Object.entries(PRESETS).find(([, preset]) =>
        Object.entries({ ...DEFAULTS, ...preset }).every(([name, value]) => params[name] === value));
    selPreset.value = match ? match[0] : "";
}

buildCases();
readHash();
syncPreset();
applyAll();
