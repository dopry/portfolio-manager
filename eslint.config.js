import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/", "coverage/", "test-results/", "xml-schemas/"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Disable stylistic rules that conflict with Prettier; formatting is
  // Prettier's job (npm run format), correctness is ESLint's.
  prettier,
  {
    rules: {
      // The XML response types are hand-modeled from the XSDs; until the
      // envelope is runtime-validated some casts through unknown remain.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.spec.ts", "src/test/**", "test/**", "scripts/**"],
    rules: {
      // Specs stub API payloads with partial shapes; keep the noise down.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
);
