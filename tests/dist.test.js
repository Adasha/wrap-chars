// Smoke tests for the built files, to catch packaging mistakes
// (wrong format, missing global, broken exports).

import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");


beforeAll(() =>
{
    execFileSync(process.execPath, ["scripts/build.js"], { cwd: root });
});


describe("dist", () =>
{
    it("wrap-chars.mjs exports the class as default and named export", async () =>
    {
        const mod = await import(join(root, "dist/wrap-chars.mjs"));
        expect(mod.WrapChars).toBe(mod.default);

        const el = document.createElement("div");
        el.textContent = "ab";
        mod.default.wrap(el, { accessible: false });
        expect(el.innerHTML).toBe('<span data-wrapchars="piece">a</span><span data-wrapchars="piece">b</span>');
    });

    it("ships type declarations covering every option", () =>
    {
        const dts = readFileSync(join(root, "dist/wrap-chars.d.ts"), "utf8");
        const src = readFileSync(join(root, "src/WrapChars.js"), "utf8");
        const documented = [...src.matchAll(/@param \{[^}]+\} \[params\.(\w+)/g)].map(m => m[1]);

        expect(documented.length).toBeGreaterThan(0);
        for (const option of documented) expect(dts).toContain(`${option}?:`);
        expect(dts).toContain("static unwrap(");
    });

    it("wrap-chars.min.js defines a global WrapChars when run as a classic script", () =>
    {
        const code = readFileSync(join(root, "dist/wrap-chars.min.js"), "utf8");
        delete globalThis.WrapChars;

        // Indirect eval runs in global scope, like a classic <script>.
        (0, eval)(code);
        expect(typeof globalThis.WrapChars?.wrap).toBe("function");

        const el = document.createElement("div");
        el.textContent = "ab";
        globalThis.WrapChars.wrap(el, { accessible: false });
        expect(el.innerHTML).toBe('<span data-wrapchars="piece">a</span><span data-wrapchars="piece">b</span>');

        delete globalThis.WrapChars;
    });
});
