'use client';

import { useState, useEffect } from 'react';
import { Etablissement, EtablissementFormData } from '@/types/etablissement';
import { useEtablissementStore } from '@/stores/etablissementStore';
import { usePersonnelStore } from '@/stores/personnelStore';
import ImageUploader from '@/components/systemes/ImageUploader';

interface EtablissementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (etablissement: Etablissement) => void;
    provinceId: string;
}

const EtablissementModal: React.FC<EtablissementModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    provinceId
}) => {
    const { createEtablissement, isLoading } = useEtablissementStore();
    const { personnels, loadPersonnels } = usePersonnelStore();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<EtablissementFormData>({
        designation: '',
        sigle: '',
        logo: '',
        categorie: 'public',
        description: '',
        coge: [],
        provinceId: provinceId
    });

    // Charger les personnels au montage du modal
    useEffect(() => {
        if (isOpen) {
            loadPersonnels();
        }
    }, [isOpen, loadPersonnels]);

    // Réinitialiser le formulaire quand le modal se ferme
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1);
            setFormData({
                designation: '',
                sigle: '',
                logo: '',
                categorie: 'public',
                description: '',
                coge: [],
                provinceId: provinceId
            });
        }
    }, [isOpen, provinceId]);

    const handleSubmit = async () => {
        try {
            const newEtablissement = await createEtablissement(formData);
            if (newEtablissement) {
                onSuccess(newEtablissement);
                onClose();
            }
        } catch (error) {
            console.error('Erreur lors de la création:', error);
        }
    };

    const addCogeMembre = () => {
        setFormData(prev => ({
            ...prev,
            coge: [...prev.coge, { membreId: '', role: 'AB' }]
        }));
    };

    const updateCogeMembre = (index: number, field: 'membreId' | 'role', value: string) => {
        setFormData(prev => ({
            ...prev,
            coge: prev.coge.map((membre, i) => 
                i === index ? { ...membre, [field]: value } : membre
            )
        }));
    };

    const removeCogeMembre = (index: number) => {
        setFormData(prev => ({
            ...prev,
            coge: prev.coge.filter((_, i) => i !== index)
        }));
    };

    const canProceedStep1 = formData.designation.trim() !== '' && formData.sigle.trim() !== '';
    const canProceedStep2 = formData.description.trim() !== '';

    if (!isOpen) return null;

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Informations de base
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Définissez les informations principales de l'établissement
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom de l'établissement *
                    </label>
                    <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                        placeholder="Ex: Université de Kinshasa"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sigle *
                    </label>
                    <input
                        type="text"
                        value={formData.sigle}
                        onChange={(e) => setFormData(prev => ({ ...prev, sigle: e.target.value }))}
                        placeholder="Ex: UNIKIN"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie
                </label>
                <select
                    value={formData.categorie}
                    onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value as 'public' | 'privee' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="public">Public</option>
                    <option value="privee">Privé</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Province
                </label>
                <input
                    type="text"
                    value="Province sélectionnée"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                />
            </div>

            <div>
                <ImageUploader
                    currentImageUrl={formData.logo}
                    onImageUploaded={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                    onImageRemoved={() => setFormData(prev => ({ ...prev, logo: '' }))}
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Description et mission
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Décrivez la mission et les objectifs de l'établissement
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description de l'établissement *
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    placeholder="Décrivez la mission, les objectifs et les spécificités de l'établissement..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Comité de Gestion (COGE)
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Définissez les membres du comité de gestion
                </p>
            </div>

            <div className="space-y-4">
                {formData.coge.map((membre, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Personnel
                            </label>
                            <select
                                value={membre.membreId}
                                onChange={(e) => updateCogeMembre(index, 'membreId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            >
                                <option value="">Sélectionner un personnel</option>
                                {personnels.map((personnel) => (
                                    <option key={personnel._id} value={personnel._id}>
                                        {personnel.nom} {personnel.prenom} - {personnel.categorie} {personnel.grade ? `(${personnel.grade})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="w-32">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Rôle
                            </label>
                            <select
                                value={membre.role}
                                onChange={(e) => updateCogeMembre(index, 'role', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            >
                                <option value="DG">DG</option>
                                <option value="SGACAD">SGACAD</option>
                                <option value="SGAD">SGAD</option>
                                <option value="SGR">SGR</option>
                                <option value="AB">AB</option>
                            </select>
                        </div>
                        
                        <button
                            onClick={() => removeCogeMembre(index)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))}
                
                <button
                    onClick={addCogeMembre}
                    className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Ajouter un membre au COGE</span>
                </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="font-medium text-blue-700 dark:text-blue-300">💡 Rôles du COGE :</p>
                <p>• <strong>DG</strong> - Directeur Général</p>
                <p>• <strong>SGACAD</strong> - Secrétaire Général Académique</p>
                <p>• <strong>SGAD</strong> - Secrétaire Général Administratif</p>
                <p>• <strong>SGR</strong> - Secrétaire Général de Recherche</p>
                <p>• <strong>AB</strong> - Administrateur Budget</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Progress bar */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Créer un nouvel établissement
                        </h2>
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3].map((step) => (
                                <div
                                    key={step}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        step === currentStep
                                            ? 'bg-blue-600 text-white'
                                            : step < currentStep
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    {step < currentStep ? '✓' : step}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Étape {currentStep} sur 3
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </div>

                {/* Actions */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                    
                    <div className="flex space-x-3">
                        {currentStep > 1 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                                Précédent
                            </button>
                        )}
                        
                        {currentStep < 3 ? (
                            <button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={
                                    (currentStep === 1 && !canProceedStep1) ||
                                    (currentStep === 2 && !canProceedStep2)
                                }
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                Suivant
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
                            >
                                {isLoading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                Créer l'établissement
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EtablissementModal;
