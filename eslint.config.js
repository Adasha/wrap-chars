import js from "@eslint/js";
import globals from "globals";

export default [
    { ignores: ["dist/"] },

    js.configs.recommended,

    {
        files: ["src/**/*.js"],
        languageOptions: { globals: globals.browser },
    },

    {
        // Tests run in Node with a jsdom-provided browser environment.
        files: ["tests/**/*.js"],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
    },

    {
        files: ["scripts/**/*.js", "*.config.js"],
        languageOptions: { globals: globals.node },
    },
];
