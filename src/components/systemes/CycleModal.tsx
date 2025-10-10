'use client';

import { useState, useEffect } from 'react';
import { Cycle } from '@/types/systemes';

interface CycleModalProps {
    cycle?: Cycle;
    isOpen: boolean;
    onClose: () => void;
    onSave: (cycle: Cycle) => void;
}

const CycleModal: React.FC<CycleModalProps> = ({ cycle, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Cycle>({
        designation: '',
        description: [''],
        classes: [],
        photo: ''
    });

    useEffect(() => {
        if (cycle) {
            setFormData({
                ...cycle,
                description: [...cycle.description],
                classes: [...cycle.classes]
            });
        } else {
            setFormData({
                designation: '',
                description: [''],
                classes: [],
                photo: ''
            });
        }
    }, [cycle, isOpen]);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const addDescription = () => {
        setFormData(prev => ({
            ...prev,
            description: [...prev.description, '']
        }));
    };

    const updateDescription = (index: number, value: string) => {
        const newDescriptions = [...formData.description];
        newDescriptions[index] = value;
        setFormData(prev => ({ ...prev, description: newDescriptions }));
    };

    const removeDescription = (index: number) => {
        if (formData.description.length > 1) {
            const newDescriptions = formData.description.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, description: newDescriptions }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {cycle ? 'Modifier le cycle' : 'Créer un nouveau cycle'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom du cycle *
                        </label>
                        <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                            placeholder="Ex: Licence, Master, Doctorat..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sections de description
                        </label>
                        <div className="space-y-4">
                            {formData.description.map((section, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Section {index + 1}
                                        </h4>
                                        {formData.description.length > 1 && (
                                            <button
                                                onClick={() => removeDescription(index)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Supprimer cette section"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <textarea
                                        value={section}
                                        onChange={(e) => updateDescription(index, e.target.value)}
                                        placeholder={`Contenu de la section ${index + 1}...&#10;&#10;Vous pouvez utiliser plusieurs lignes&#10;dans cette section.`}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                    />
                                    
                                    {/* Preview de la section */}
                                    {section.trim() !== '' && (
                                        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                Aperçu :
                                            </div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                                {section}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            <button
                                onClick={addDescription}
                                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Ajouter une nouvelle section</span>
                            </button>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                <p className="font-medium text-blue-700 dark:text-blue-300">💡 Comment utiliser les sections :</p>
                                <p>• Chaque section peut contenir plusieurs paragraphes avec retours à la ligne</p>
                                <p>• Les sections seront affichées séparément dans le dashboard</p>
                                <p>• Utilisez les sections pour organiser : introduction, objectifs, contenu, etc.</p>
                            </div>
                        </div>
                    </div>

                    {cycle && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Ce cycle contient {cycle.classes.length} classe{cycle.classes.length > 1 ? 's' : ''}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-300">
                                        Les classes existantes seront conservées lors de la modification
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!formData.designation.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                        {cycle ? 'Sauvegarder' : 'Créer le cycle'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CycleModal;
