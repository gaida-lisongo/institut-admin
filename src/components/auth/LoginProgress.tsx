"use client";

import React from "react";

interface LoginStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
  timestamp?: string;
}

interface LoginProgressProps {
  isVisible: boolean;
  steps: LoginStep[];
}

export default function LoginProgress({ isVisible, steps }: LoginProgressProps) {
  if (!isVisible) return null;

  const completedSteps = steps.filter(step => step.status === 'success').length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
        {/* En-tête */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Authentification en cours
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {completedSteps}/{totalSteps} étapes terminées
          </p>
        </div>

        {/* Barre de progression globale */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progression
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Étapes détaillées */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              {/* Icône d'état */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step.status === 'success' 
                  ? 'bg-green-500 text-white' 
                  : step.status === 'error'
                    ? 'bg-red-500 text-white'
                    : step.status === 'loading' 
                      ? 'bg-blue-500 text-white animate-pulse' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                {step.status === 'success' ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.status === 'error' ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : step.status === 'loading' ? (
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                ) : (
                  index + 1
                )}
              </div>

              {/* Contenu de l'étape */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    step.status === 'success' 
                      ? 'text-green-700 dark:text-green-400' 
                      : step.status === 'error'
                        ? 'text-red-700 dark:text-red-400'
                        : step.status === 'loading'
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {step.timestamp}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {step.description}
                </p>

                {/* Affichage des données de debug */}
                {step.status === 'success' && step.data && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                    <span className="text-green-600 dark:text-green-400 font-medium">✓ Données reçues:</span>
                    <pre className="text-green-700 dark:text-green-300 mt-1 whitespace-pre-wrap">
                      {typeof step.data === 'object' ? JSON.stringify(step.data, null, 2) : step.data}
                    </pre>
                  </div>
                )}

                {/* Affichage des erreurs */}
                {step.status === 'error' && step.error && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
                    <span className="text-red-600 dark:text-red-400 font-medium">✗ Erreur:</span>
                    <p className="text-red-700 dark:text-red-300 mt-1">{step.error}</p>
                  </div>
                )}

                {/* Barre de progression pour l'étape en cours */}
                {step.status === 'loading' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full animate-pulse w-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer avec info de debug */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Mode développement - Détails techniques affichés
          </p>
        </div>
      </div>
    </div>
  );
}
