import js from "@eslint/js";
import globals from "globals";

export default [
    { ignores: ["dist/"] },

    js.configs.recommended,

    {
        files: ["src/**/*.js", "tests/**/*.js"],
        languageOptions: { globals: globals.browser },
    },

    {
        files: ["scripts/**/*.js", "eslint.config.js"],
        languageOptions: { globals: globals.node },
    },
];
