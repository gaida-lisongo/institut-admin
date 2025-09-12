import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Désactiver les variables non utilisées (convertir en warnings)
      "@typescript-eslint/no-unused-vars": "warn",
      
      // Permettre l'utilisation d'any
      "@typescript-eslint/no-explicit-any": "off",
      
      // Permettre les apostrophes non échappées
      "react/no-unescaped-entities": "off",
      
      // Convertir les avertissements d'images en warnings
      "@next/next/no-img-element": "warn",
      
      // Assouplir les règles des hooks
      "react-hooks/exhaustive-deps": "warn",
      
      // Permettre les exports anonymes
      "import/no-anonymous-default-export": "warn",
      
      // Désactiver les règles strictes de Next.js
      "@next/next/no-html-link-for-pages": "off",
    }
  }
];

export default eslintConfig;
