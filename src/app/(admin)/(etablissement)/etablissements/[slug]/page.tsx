'use client';

import { useParams } from 'next/navigation';
import EtablissementsManager from '@/components/etablissements/EtablissementsManager';

export default function EtablissementsPage() {
    const params = useParams();
    const provinceId = params.slug as string;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header de la page */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Établissements d'enseignement supérieur
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Gestion des établissements par province
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <EtablissementsManager 
                    provinceId={provinceId}
                />
            </div>
        </div>
    );
}