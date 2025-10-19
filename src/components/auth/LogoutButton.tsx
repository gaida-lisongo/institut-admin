"use client";
import React from 'react';
import { LogOut } from 'lucide-react';
import { useSessionManager } from './SessionManager';

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
  variant?: 'button' | 'link' | 'icon';
  onLogout?: () => void;
}

/**
 * Bouton de déconnexion qui nettoie automatiquement la session
 */
export default function LogoutButton({ 
  className = "", 
  showText = true, 
  variant = "button",
  onLogout 
}: LogoutButtonProps) {
  const { logout } = useSessionManager();

  const handleLogout = async () => {
    try {
      // Appeler le callback personnalisé si fourni
      if (onLogout) {
        await onLogout();
      }
      
      // Nettoyer la session et rediriger
      logout();
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      // Forcer le nettoyage même en cas d'erreur
      logout();
    }
  };

  const baseClasses = "inline-flex items-center gap-2 transition-colors";
  
  const variantClasses = {
    button: "rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600",
    link: "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
    icon: "rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
  };

  return (
    <button
      onClick={handleLogout}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      title="Se déconnecter"
    >
      <LogOut className="h-4 w-4" />
      {showText && <span>Déconnexion</span>}
    </button>
  );
}

/**
 * Hook pour la déconnexion programmatique
 */
export function useLogout() {
  const { logout } = useSessionManager();
  
  return {
    logout: async (callback?: () => void) => {
      try {
        if (callback) {
          await callback();
        }
        logout();
      } catch (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
        logout();
      }
    }
  };
}
