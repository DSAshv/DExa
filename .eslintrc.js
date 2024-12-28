module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2021: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:vue/vue3-recommended",
        "@vue/eslint-config-standard",
    ],
    plugins: [
        "vue",
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
    },
    overrides: [
        {
            files: ["*.vue"],
            rules: {
                "vue/html-indent": ["error", 4],
                "vue/multi-word-component-names": "off",
            },
        },
    ],
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        indent: ["error", 4],
        "no-unused-vars": "warn",
        "comma-dangle": ["error", "always-multiline"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        eqeqeq: ["error", "always"],
        curly: ["error", "all"],
        "brace-style": ["error", "1tbs"],
        "no-multiple-empty-lines": ["error", { max: 2 }],
        "space-before-function-paren": ["error", "never"],
        "padded-blocks": "off",
        "no-trailing-spaces": "off",
    },
};
