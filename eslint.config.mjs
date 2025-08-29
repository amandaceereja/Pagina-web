// eslint.config.mjs  (Flat config para ESLint v9)
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // 1) Ignorados (sustituye al antiguo .eslintignore)
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "e2e/playwright-report/**",
      "e2e/test-results/**",
    ],
  },

  // 2) Reglas recomendadas básicas
  js.configs.recommended,

  // 3) Tu configuración para JS + plugin import
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        // Declaramos globals de terceros para que no marque "no-undef":
        gtag: "readonly",
        gsap: "readonly",
        ScrollTrigger: "readonly",
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Ajustes útiles
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": "off",

      // Orden de imports (cómodo para mantener orden)
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },

  // 4) Al final: desactiva reglas que chocan con Prettier
  prettier,
];
