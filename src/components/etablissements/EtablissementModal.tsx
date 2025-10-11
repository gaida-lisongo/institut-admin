'use client';

import { useState, useEffect, useRef } from 'react';
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
        reference: '',
        description: '',
        coge: [],
        provinceId: provinceId
    });

    // États pour la recherche de personnel
    const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
    const [showDropdowns, setShowDropdowns] = useState<Record<number, boolean>>({});
    const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});

    // Charger les personnels au montage du modal
    useEffect(() => {
        if (isOpen) {
            loadPersonnels();
        }
    }, [isOpen, loadPersonnels]);

    // Initialiser les termes de recherche pour les membres existants
    useEffect(() => {
        if (personnels.length > 0 && formData.coge.length > 0) {
            const newSearchTerms: Record<number, string> = {};
            formData.coge.forEach((membre, index) => {
                if (membre.membreId) {
                    // Gérer le cas où membreId peut être un string (ID) ou un objet (données populées)
                    let personnel;
                    if (typeof membre.membreId === 'string') {
                        personnel = personnels.find(p => p._id === membre.membreId);
                    } else if (typeof membre.membreId === 'object' && membre.membreId) {
                        // Si membreId est un objet (données populées du backend)
                        personnel = membre.membreId as any;
                    }
                    
                    if (personnel) {
                        const matricule = personnel.matricule || personnel._id;
                        newSearchTerms[index] = `${personnel.nom} ${personnel.prenom} - ${matricule}`;
                    }
                }
            });
            setSearchTerms(prev => ({ ...prev, ...newSearchTerms }));
        }
    }, [personnels, formData.coge]);

    // Réinitialiser le formulaire quand le modal se ferme
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1);
            setFormData({
                designation: '',
                sigle: '',
                logo: '',
                categorie: 'public',
                reference: '',
                description: '',
                coge: [],
                provinceId: provinceId
            });
            // Nettoyer les états de recherche
            setSearchTerms({});
            setShowDropdowns({});
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
        const newIndex = formData.coge.length;
        setFormData(prev => ({
            ...prev,
            coge: [...prev.coge, { membreId: '', role: 'AB' }]
        }));
        // Initialiser le terme de recherche pour le nouveau membre
        setSearchTerms(prev => ({ ...prev, [newIndex]: '' }));
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
        // Nettoyer les états de recherche
        setSearchTerms(prev => {
            const newTerms = { ...prev };
            delete newTerms[index];
            return newTerms;
        });
        setShowDropdowns(prev => {
            const newDropdowns = { ...prev };
            delete newDropdowns[index];
            return newDropdowns;
        });
    };

    // Filtrer les personnels selon le terme de recherche
    const getFilteredPersonnels = (searchTerm: string) => {
        if (!searchTerm.trim()) return personnels.slice(0, 50); // Limiter à 50 résultats par défaut
        
        return personnels.filter(personnel => {
            const fullName = `${personnel.nom} ${personnel.prenom}`.toLowerCase();
            const matricule = personnel.matricule?.toLowerCase() || '';
            const grade = personnel.grade?.toLowerCase() || '';
            const categorie = personnel.categorie?.toLowerCase() || '';
            const search = searchTerm.toLowerCase();
            
            return fullName.includes(search) || 
                   matricule.includes(search) || 
                   grade.includes(search) || 
                   categorie.includes(search);
        }).slice(0, 20); // Limiter à 20 résultats de recherche
    };

    // Sélectionner un personnel
    const selectPersonnel = (index: number, personnelId: string) => {
        updateCogeMembre(index, 'membreId', personnelId);
        const personnel = personnels.find(p => p._id === personnelId);
        if (personnel) {
            const matricule = personnel.matricule || personnelId;
            setSearchTerms(prev => ({
                ...prev,
                [index]: `${personnel.nom} ${personnel.prenom} - ${matricule}`
            }));
        }
        setShowDropdowns(prev => ({ ...prev, [index]: false }));
    };

    // Gérer le focus et blur du champ de recherche
    const handleSearchFocus = (index: number) => {
        setShowDropdowns(prev => ({ ...prev, [index]: true }));
    };

    const handleSearchBlur = (index: number) => {
        // Délai pour permettre le clic sur les options
        setTimeout(() => {
            setShowDropdowns(prev => ({ ...prev, [index]: false }));
        }, 150);
    };

    const canProceedStep1 = formData.designation.trim() !== '' && formData.sigle.trim() !== '' && formData.reference.trim() !== '';
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
                    Référence (N° d'arrêté) *
                </label>
                <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Ex: 001/MINESU/CABMIN/2024"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Numéro de l'arrêté ministériel instituant l'établissement
                </p>
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
                        <div className="flex-1 relative">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Personnel
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerms[index] || ''}
                                    onChange={(e) => setSearchTerms(prev => ({ ...prev, [index]: e.target.value }))}
                                    onFocus={() => handleSearchFocus(index)}
                                    onBlur={() => handleSearchBlur(index)}
                                    placeholder="Rechercher un personnel (nom, matricule, grade...)"
                                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                
                                {/* Dropdown des résultats */}
                                {showDropdowns[index] && (
                                    <div 
                                        ref={el => dropdownRefs.current[index] = el}
                                        className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                    >
                                        {getFilteredPersonnels(searchTerms[index] || '').length > 0 ? (
                                            getFilteredPersonnels(searchTerms[index] || '').map((personnel) => (
                                                <button
                                                    key={personnel._id}
                                                    type="button"
                                                    onClick={() => selectPersonnel(index, personnel._id!)}
                                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {personnel.nom} {personnel.prenom}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {personnel.matricule} • {personnel.categorie} {personnel.grade ? `• ${personnel.grade}` : ''}
                                                            </div>
                                                        </div>
                                                        {((typeof membre.membreId === 'string' && membre.membreId === personnel._id) || 
                                                          (typeof membre.membreId === 'object' && membre.membreId && membre.membreId._id === personnel._id)) && (
                                                            <div className="text-blue-500">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                {searchTerms[index] ? 'Aucun personnel trouvé' : 'Tapez pour rechercher...'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
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
