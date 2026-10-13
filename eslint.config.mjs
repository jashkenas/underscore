import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([{
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.amd,
    },

    ecmaVersion: 3,
    sourceType: "commonjs",
  },
}, {
  files: ["modules/**/*"],
  languageOptions: {
    sourceType: "module",
  },
}]);
