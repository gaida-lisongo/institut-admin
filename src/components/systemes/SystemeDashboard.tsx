'use client';

import { useState, useEffect } from 'react';
import { Systeme, Cycle, Classe } from '@/types/systemes';
import { useSystemeStore } from '@/stores/systemeStore';
import ImageUploader from './ImageUploader';
import ClasseCard from './ClasseCard';
import ClasseModal from './ClasseModal';
import CycleModal from './CycleModal';

interface SystemeDashboardProps {
    systeme: Systeme;
    onBack: () => void;
}

const SystemeDashboard: React.FC<SystemeDashboardProps> = ({ systeme, onBack }) => {
    const { updateSysteme } = useSystemeStore();
    const [selectedCycleIndex, setSelectedCycleIndex] = useState(0);
    const [localSysteme, setLocalSysteme] = useState<Systeme>(systeme);
    
    // États des modals
    const [showCycleModal, setShowCycleModal] = useState(false);
    const [showClasseModal, setShowClasseModal] = useState(false);
    const [editingClasse, setEditingClasse] = useState<Classe | null>(null);
    const [editingClasseIndex, setEditingClasseIndex] = useState<number | null>(null);

    const selectedCycle = localSysteme.cycles[selectedCycleIndex];

    // Sauvegarder les modifications
    const saveChanges = async () => {
        if (localSysteme._id) {
            await updateSysteme(localSysteme._id, {
                designation: localSysteme.designation,
                description: localSysteme.description,
                cycles: localSysteme.cycles,
                photo: localSysteme.photo
            });
        }
    };

    // Mettre à jour l'image du système
    const handleSystemeImageUpdate = async (url: string) => {
        const updatedSysteme = { ...localSysteme, photo: url };
        setLocalSysteme(updatedSysteme);
        
        // Envoyer le système complet au serveur
        if (updatedSysteme._id) {
            await updateSysteme(updatedSysteme._id, {
                designation: updatedSysteme.designation,
                description: updatedSysteme.description,
                cycles: updatedSysteme.cycles,
                photo: updatedSysteme.photo
            });
        }
    };

    // Mettre à jour l'image du cycle
    const handleCycleImageUpdate = async (url: string) => {
        const updatedCycles = [...localSysteme.cycles];
        if (!updatedCycles[selectedCycleIndex]) {
            updatedCycles[selectedCycleIndex] = { ...selectedCycle };
        }
        updatedCycles[selectedCycleIndex] = { ...updatedCycles[selectedCycleIndex], photo: url };
        const updatedSysteme = { ...localSysteme, cycles: updatedCycles };
        setLocalSysteme(updatedSysteme);
        
        // Envoyer le système complet au serveur
        if (updatedSysteme._id) {
            await updateSysteme(updatedSysteme._id, {
                designation: updatedSysteme.designation,
                description: updatedSysteme.description,
                cycles: updatedSysteme.cycles,
                photo: updatedSysteme.photo
            });
        }
    };

    // Gestion des classes
    const handleEditClasse = (classe: Classe, index: number) => {
        setEditingClasse(classe);
        setEditingClasseIndex(index);
        setShowClasseModal(true);
    };

    const handleCreateClasse = () => {
        setEditingClasse(null);
        setEditingClasseIndex(null);
        setShowClasseModal(true);
    };

    const handleSaveClasse = async (classe: Classe) => {
        const updatedCycles = [...localSysteme.cycles];
        if (editingClasseIndex !== null) {
            // Modification
            updatedCycles[selectedCycleIndex].classes[editingClasseIndex] = classe;
        } else {
            // Création
            updatedCycles[selectedCycleIndex].classes.push(classe);
        }
        const updatedSysteme = { ...localSysteme, cycles: updatedCycles };
        setLocalSysteme(updatedSysteme);
        
        // Envoyer le système complet au serveur
        if (updatedSysteme._id) {
            await updateSysteme(updatedSysteme._id, {
                designation: updatedSysteme.designation,
                description: updatedSysteme.description,
                cycles: updatedSysteme.cycles,
                photo: updatedSysteme.photo
            });
        }
    };

    const handleDeleteClasse = async (classeIndex: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
            const updatedCycles = [...localSysteme.cycles];
            updatedCycles[selectedCycleIndex].classes = updatedCycles[selectedCycleIndex].classes.filter((_, index) => index !== classeIndex);
            const updatedSysteme = { ...localSysteme, cycles: updatedCycles };
            setLocalSysteme(updatedSysteme);
            
            // Envoyer le système complet au serveur
            if (updatedSysteme._id) {
                await updateSysteme(updatedSysteme._id, {
                    designation: updatedSysteme.designation,
                    description: updatedSysteme.description,
                    cycles: updatedSysteme.cycles,
                    photo: updatedSysteme.photo
                });
            }
        }
    };

    // Gestion des cycles
    const handleEditCycle = () => {
        setShowCycleModal(true);
    };

    const handleSaveCycle = async (cycle: Cycle) => {
        const updatedCycles = [...localSysteme.cycles];
        updatedCycles[selectedCycleIndex] = { ...cycle, classes: selectedCycle.classes };
        const updatedSysteme = { ...localSysteme, cycles: updatedCycles };
        setLocalSysteme(updatedSysteme);
        
        // Envoyer le système complet au serveur
        if (updatedSysteme._id) {
            await updateSysteme(updatedSysteme._id, {
                designation: updatedSysteme.designation,
                description: updatedSysteme.description,
                cycles: updatedSysteme.cycles,
                photo: updatedSysteme.photo
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

            {/* Bannière avec image modifiable */}
            <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
                {/* Bouton retour en position absolue sur la bannière */}
                <button
                    onClick={() => {
                        console.log('Bouton retour cliqué');
                        onBack();
                    }}
                    className="absolute top-4 left-4 z-20 flex items-center px-4 py-2 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg text-white hover:bg-black/50 transition-all duration-200"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour aux systèmes
                </button>
                {localSysteme.photo ? (
                    <img 
                        src={localSysteme.photo} 
                        alt={localSysteme.designation}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <svg className="w-20 h-20 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                )}
                
                {/* Overlay pour modification */}
                <div className="absolute inset-0 bg-black/20 flex items-end">
                    <div className="w-full p-6">
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {localSysteme.designation}
                                </h2>
                                <div className="flex items-center space-x-4 text-white/80">
                                    <span>{localSysteme.cycles.length} cycle{localSysteme.cycles.length > 1 ? 's' : ''}</span>
                                    <span>
                                        {localSysteme.cycles.reduce((acc, cycle) => acc + cycle.classes.length, 0)} classe{localSysteme.cycles.reduce((acc, cycle) => acc + cycle.classes.length, 0) > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <ImageUploader
                                    currentImageUrl={localSysteme.photo}
                                    onImageUploaded={handleSystemeImageUpdate}
                                    onImageRemoved={() => handleSystemeImageUpdate('')}
                                    className="w-48"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header avec navigation */}
            {/* <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {localSysteme.designation}
                        </h1>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => {
                                console.log('Bouton retour alternatif cliqué');
                                onBack();
                            }}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                        >
                            ← Retour
                        </button>
                        <button
                            onClick={saveChanges}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Sauvegarder
                        </button>
                    </div>
                </div>
            </div> */}

            {/* Contenu principal */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Sélecteur de cycle */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Gestion des cycles
                            </h3>
                            
                            <div className="flex items-center space-x-4">
                                <select
                                    value={selectedCycleIndex}
                                    onChange={(e) => setSelectedCycleIndex(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {localSysteme.cycles.map((cycle, index) => (
                                        <option key={index} value={index}>
                                            {cycle.designation || `Cycle ${index + 1}`}
                                        </option>
                                    ))}
                                </select>
                                
                                <button
                                    onClick={handleEditCycle}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Modifier cycle
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Informations du cycle sélectionné */}
                    {selectedCycle && (
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                        {selectedCycle.designation}
                                    </h4>
                                    <div className="space-y-4">
                                        {selectedCycle.description.map((section, index) => (
                                            <div key={index} className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                                                {section}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {selectedCycle.classes.length} classe{selectedCycle.classes.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {selectedCycle.classes.reduce((acc, classe) => acc + classe.credit, 0)} crédits total
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Grille des classes en cartes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Classes du cycle: {selectedCycle?.designation}
                            </h3>
                            
                            <button
                                onClick={handleCreateClasse}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Ajouter une classe
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {selectedCycle?.classes && selectedCycle.classes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {selectedCycle.classes.map((classe, index) => (
                                    <ClasseCard
                                        key={index}
                                        classe={classe}
                                        onEdit={() => handleEditClasse(classe, index)}
                                        onDelete={() => handleDeleteClasse(index)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Aucune classe
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Ce cycle ne contient aucune classe pour le moment.
                                </p>
                                <button
                                    onClick={handleCreateClasse}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Ajouter la première classe
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ClasseModal
                classe={editingClasse}
                isOpen={showClasseModal}
                onClose={() => {
                    setShowClasseModal(false);
                    setEditingClasse(null);
                    setEditingClasseIndex(null);
                }}
                onSave={handleSaveClasse}
            />

            <CycleModal
                cycle={selectedCycle}
                isOpen={showCycleModal}
                onClose={() => setShowCycleModal(false)}
                onSave={handleSaveCycle}
            />
        </div>
    );
};

export default SystemeDashboard;
