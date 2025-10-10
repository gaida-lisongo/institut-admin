'use client';

import Link from "next/link";
import { ShieldX, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
            <ShieldX className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Accès Non Autorisé
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Que pouvez-vous faire ?
              </h2>
              
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Vérifiez que vous êtes connecté avec le bon compte
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Contactez votre administrateur pour obtenir les autorisations nécessaires
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Retournez à une page autorisée
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/"
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Page précédente
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Code d'erreur: 403 - Forbidden
          </p>
        </div>
      </div>
    </div>
  );
}
