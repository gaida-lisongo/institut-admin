"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { PasswordUtils } from "@/utils/passwordUtils";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  agentName: string;
}

export default function PasswordModal({
  isOpen,
  onClose,
  onConfirm,
  agentName,
}: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateNewPassword = () => {
    setIsGenerating(true);
    // Petit délai pour l'effet visuel
    setTimeout(() => {
      const newPassword = PasswordUtils.generateSecurePassword(12);
      setPassword(newPassword);
      setShowPassword(true);
      setIsGenerating(false);
    }, 500);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      alert("Mot de passe copié dans le presse-papiers !");
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
      // Fallback pour les navigateurs qui ne supportent pas l'API clipboard
      const textArea = document.createElement("textarea");
      textArea.value = password;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        alert("Mot de passe copié dans le presse-papiers !");
      } catch (fallbackError) {
        alert("Impossible de copier automatiquement. Veuillez sélectionner et copier manuellement.");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSubmit = async () => {
    if (!password.trim()) {
      alert("Veuillez générer ou saisir un mot de passe");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(password);
      onClose();
      setPassword("");
      setShowPassword(false);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour du mot de passe");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setShowPassword(false);
    setIsGenerating(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🔑 Changer le mot de passe
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Agent: <strong>{agentName}</strong>
        </p>

        {/* Génération automatique */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Option 1: Générer automatiquement
          </h3>
          <button
            type="button"
            onClick={generateNewPassword}
            disabled={isGenerating}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Génération...</span>
              </>
            ) : (
              <>
                <span>🎲</span>
                <span>Générer un mot de passe sécurisé</span>
              </>
            )}
          </button>
        </div>

        {/* Saisie manuelle */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Option 2: Saisir manuellement
          </h3>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Saisir un nouveau mot de passe..."
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>
        </div>

        {/* Affichage du mot de passe généré */}
        {password && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                ⚠️ Mot de passe
              </h4>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-sm px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700"
              >
                📋 Copier
              </button>
            </div>
            <div className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded border break-all">
              {showPassword ? password : "••••••••••••"}
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
              ⚡ Notez ce mot de passe maintenant ! Il sera crypté après confirmation.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!password.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Mise à jour...</span>
              </>
            ) : (
              <span>Confirmer</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
