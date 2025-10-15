
"use client";

import { Construction, Wrench, Code, Rocket, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UnderDevelopmentProps {
    title?: string;
    description?: string;
    showBackButton?: boolean;
    showHomeButton?: boolean;
    estimatedDate?: string;
}

const UnderDevelopment = ({
    title = "Fonctionnalité en développement",
    description = "Cette fonctionnalité est actuellement en cours de développement. Elle sera bientôt disponible.",
    showBackButton = true,
    showHomeButton = true,
    estimatedDate
}: UnderDevelopmentProps) => {
    const router = useRouter();

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full">
                {/* Carte principale */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header avec gradient */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative">
                                <Construction className="w-20 h-20 animate-bounce" />
                                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                                    <Wrench className="w-6 h-6 text-gray-900 animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-center mb-2">
                            {title}
                        </h1>
                        <p className="text-center text-blue-100">
                            Nous travaillons dur pour vous offrir cette fonctionnalité
                        </p>
                    </div>

                    {/* Contenu */}
                    <div className="p-8">
                        {/* Description */}
                        <div className="text-center mb-8">
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                {description}
                            </p>
                        </div>

                        {/* Date estimée */}
                        {estimatedDate && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                                <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400">
                                    <Rocket className="w-5 h-5" />
                                    <span className="font-medium">
                                        Date de sortie estimée : {estimatedDate}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Fonctionnalités à venir */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Code className="w-5 h-5 text-blue-600" />
                                Ce qui arrive bientôt
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    "Interface utilisateur intuitive et moderne",
                                    "Performances optimisées",
                                    "Compatibilité mobile complète",
                                    "Fonctionnalités avancées"
                                ].map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Timeline de développement */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-8">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 text-center">
                                Progression du développement
                            </h3>
                            <div className="relative">
                                <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-600">
                                    <div 
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"
                                        style={{ width: '65%' }}
                                    >
                                        <span className="font-semibold">65%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <span>Démarré</span>
                                <span className="font-medium text-blue-600 dark:text-blue-400">En cours</span>
                                <span>Terminé</span>
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {showBackButton && (
                                <button
                                    onClick={() => router.back()}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Retour
                                </button>
                            )}
                            {showHomeButton && (
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/30"
                                >
                                    <Home className="w-5 h-5" />
                                    Accueil
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Message de support */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Des questions ? Contactez notre équipe de support à{' '}
                        <a 
                            href="mailto:support@institut.com" 
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                            support@institut.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UnderDevelopment;
