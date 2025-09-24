"use client";
import { ChargeWithDetails } from '@/services/ChargeService';
import { useState } from 'react';
import TravauxCard from './TravauxCard';
import SeancesCard from './SeancesCard';
import PlansCard from './PlansCard';

const CoursCard = ({
    charge,
    handleCourseSelect
} : {
    charge: ChargeWithDetails;
    handleCourseSelect: (charge: ChargeWithDetails) => void;
}) => {
    const [selectedView, setSelectedView] = useState<'charges' | 'travaux' | 'seances' | 'plans'>('charges');
    console.log("charge", charge);

    const handleViewChange = (view: 'charges' | 'travaux' | 'seances' | 'plans') => {
        setSelectedView(view);
    };

    // Navigation tabs
    const renderTabs = () => (
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
                {[
                    { key: 'charges', label: 'Cotations', icon: '📊' },
                    { key: 'travaux', label: 'Travaux', icon: '📝' },
                    { key: 'seances', label: 'Séances', icon: '🎓' },
                    { key: 'plans', label: 'Plans', icon: '📋' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleViewChange(tab.key as any)}
                        className={`${
                            selectedView === tab.key
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );

    // Render content based on selected view
    const renderContent = () => {
        switch (selectedView) {
            case 'travaux':
                return (
                    <TravauxCard 
                        titre={charge.cours.titre} 
                        travaux={charge.cours.travaux}
                        coursId={charge.cours._id!}
                        anneeId={charge.annee._id}
                    />
                );
            case 'seances':
                return (
                    <SeancesCard 
                        seances={charge.cours.seances}
                        titre={charge.cours.titre}
                        coursId={charge.cours._id!}
                        anneeId={charge.annee._id}
                    />
                );
            case 'plans':
                return (
                    <PlansCard 
                        plan={charge.cours.plan}
                        titre={charge.cours.titre}
                        anneeId={charge.annee._id}
                        coursId={charge.cours._id!}
                    />
                );
            default:
                return (
                    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    {charge.cours.titre}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {charge.cours.description}
                                </p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                charge.status === 'OK' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : charge.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                                {charge.status}
                            </span>
                        </div>
                
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                            <div className="flex justify-between md:flex-col md:justify-start">
                                <span className="text-gray-500 dark:text-gray-400">Année académique:</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {charge.annee.debut} - {charge.annee.fin}
                                </span>
                            </div>
                            
                            <div className="flex justify-between md:flex-col md:justify-start">
                                <span className="text-gray-500 dark:text-gray-400">Étudiants:</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {charge.fiches.length} inscrit(s)
                                </span>
                            </div>
                
                            <div className="flex justify-between md:flex-col md:justify-start">
                                <span className="text-gray-500 dark:text-gray-400">Cotations complètes:</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {charge.fiches.filter(f => f.status === 'OK').length} / {charge.fiches.length}
                                </span>
                            </div>
                        </div>
                
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => handleCourseSelect(charge)}
                                className="w-full flex items-center justify-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg py-2 px-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Cliquer pour coter les étudiants
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full space-y-6">
            {renderTabs()}
            {renderContent()}
        </div>
    );
};

export default CoursCard;
