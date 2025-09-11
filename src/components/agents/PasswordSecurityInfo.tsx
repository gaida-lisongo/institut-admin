"use client";
import React from "react";

export default function PasswordSecurityInfo() {
  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <span className="text-2xl">🔐</span>
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Sécurité des mots de passe
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <p>• <strong>Cryptage SHA1</strong> : Tous les mots de passe sont automatiquement cryptés</p>
            <p>• <strong>Génération sécurisée</strong> : Les mots de passe auto-générés contiennent majuscules, minuscules, chiffres et caractères spéciaux</p>
            <p>• <strong>Confidentialité</strong> : Les mots de passe en clair ne sont jamais stockés</p>
            <p>• <strong>Import CSV</strong> : Les mots de passe du fichier CSV seront cryptés lors de l'import</p>
          </div>
        </div>
      </div>
    </div>
  );
}
