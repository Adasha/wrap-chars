import { build } from "esbuild";
import { readFile, rm } from "node:fs/promises";

const entry = "src/WrapChars.js";
const outdir = "dist";

// Matches the syntax used in src (static private methods, Object.hasOwn).
const target = "es2022";

const pkg = JSON.parse(await readFile("package.json", "utf8"));
const banner = { js: `/*! ${pkg.name} v${pkg.version} | ${pkg.license} | ${pkg.repository.url} */` };

await rm(outdir, { recursive: true, force: true });

await Promise.all([
    // ES module for bundlers and <script type="module">.
    // Left unminified: consumers' bundlers minify it themselves.
    build({
        entryPoints: [entry],
        outfile: `${outdir}/wrap-chars.mjs`,
        format: "esm",
        target,
        bundle: true,
        legalComments: "none",
        banner,
    }),

    // Classic script for <script src> / CDN use: exposes window.WrapChars.
    build({
        stdin: {
            contents: `import WrapChars from "./${entry}"; globalThis.WrapChars = WrapChars;`,
            resolveDir: ".",
            sourcefile: "global-entry.js",
        },
        outfile: `${outdir}/wrap-chars.min.js`,
        format: "iife",
        target,
        bundle: true,
        minify: true,
        sourcemap: true,
        legalComments: "none",
        banner,
    }),
]);

console.log(`Built ${outdir}/wrap-chars.mjs and ${outdir}/wrap-chars.min.js`);
