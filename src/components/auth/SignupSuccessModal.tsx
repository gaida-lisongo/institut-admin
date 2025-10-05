'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SignupSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export default function SignupSuccessModal({ isOpen, onClose, userName }: SignupSuccessModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Auto-redirection après 3 secondes
      const timer = setTimeout(() => {
        onClose();
        router.push('/signin');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, router]);

  if (!isOpen) return null;

  const handleGoToSignin = () => {
    onClose();
    router.push('/signin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Icon de succès */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Contenu */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Inscription réussie !
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Félicitations <span className="font-medium">{userName}</span>, votre compte a été créé avec succès.
            Vous allez être redirigé vers la page de connexion.
          </p>

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-1 mb-6">
            <div 
              className="bg-green-600 h-1 rounded-full animate-pulse"
              style={{
                animation: 'progress 3s linear forwards'
              }}
            ></div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Fermer
            </button>
            <button
              onClick={handleGoToSignin}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
