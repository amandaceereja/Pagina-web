// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: false },
  extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "import/order": ["warn", { "newlines-between": "always" }],
  },
  ignorePatterns: ["node_modules/", "dist/", ".github/"],
};
