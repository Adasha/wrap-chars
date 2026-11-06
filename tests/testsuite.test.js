import { describe, it, expect, onTestFinished } from "vitest";
import { GROUPS } from "./testsuite-cases.js";
import { DEFAULTS, PRESETS, runCase } from "./testsuite-lib.js";


// Runs every case from the manual test suite page under every preset, so the
// page's examples double as regression tests.

describe("test suite cases", () =>
{
    it("have unique ids", () =>
    {
        const ids = GROUPS.flatMap(group => group.cases.map(c => c.id));
        expect(new Set(ids).size).toBe(ids.length);
    });

    for (const [presetName, preset] of Object.entries(PRESETS))
    {
        describe(presetName, () =>
        {
            for (const group of GROUPS)
            {
                for (const testCase of group.cases)
                {
                    it(`${group.title}: ${testCase.title}`, () =>
                    {
                        // Attached, so computed styles (white-space) apply as in a browser.
                        const sample = document.body.appendChild(document.createElement("div"));
                        onTestFinished(() => sample.remove());
                        const failures = runCase(sample, testCase, { ...DEFAULTS, ...preset })
                            .filter(result => !result.ok)
                            .map(result => `${result.name} (${result.detail})`);
                        expect(failures).toEqual([]);
                    });
                }
            }
        });
    }
});
