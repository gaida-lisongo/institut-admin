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
      "@typescript-eslint/no-unused-vars": "off",
      
      // Permettre les apostrophes non échappées
      "react/no-unescaped-entities": "off",
      
      // Convertir les avertissements d'images en warnings
      // "@next/next/no-img-element": "warn",
      "@next/next/no-img-element": "off", 
      
      // Assouplir les règles des hooks
      // "react-hooks/exhaustive-deps": "warn",
      "react-hooks/exhaustive-deps": "off",
      
      // Permettre les exports anonymes
      // "import/no-anonymous-default-export": "warn",
      "import/no-anonymous-default-export": "off",
      
      // Désactiver les règles strictes de Next.js
      "@next/next/no-html-link-for-pages": "off",
      // Désactiver les règles strictes pour réduire les warnings
      "@typescript-eslint/no-empty-object-type": "off",
      "prefer-const": "off"
    }
  }
];

export default eslintConfig;
