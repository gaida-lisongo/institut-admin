'use client';

import { useState } from 'react';
import { Etablissement, EtablissementFormData } from '@/types/etablissement';
import { useEtablissementStore } from '@/stores/etablissementStore';
import ImageUploader from '@/components/systemes/ImageUploader';

interface EtablissementDetailProps {
    etablissement: Etablissement;
    onBack: () => void;
}

const EtablissementDetail: React.FC<EtablissementDetailProps> = ({
    etablissement,
    onBack
}) => {
    const { updateEtablissement, updateEtablissementLocal } = useEtablissementStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<EtablissementFormData>({
        designation: etablissement.designation,
        sigle: etablissement.sigle,
        logo: etablissement.logo,
        categorie: etablissement.categorie,
        description: etablissement.description,
        coge: [...etablissement.coge],
        provinceId: etablissement.provinceId
    });

    const handleSave = async () => {
        if (!etablissement._id) return;

        setIsLoading(true);
        try {
            const updatedEtablissement = await updateEtablissement(etablissement._id, formData);
            if (updatedEtablissement) {
                setIsEditing(false);
                // Mettre à jour l'établissement local
                updateEtablissementLocal(etablissement._id, updatedEtablissement);
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            designation: etablissement.designation,
            sigle: etablissement.sigle,
            logo: etablissement.logo,
            categorie: etablissement.categorie,
            description: etablissement.description,
            coge: [...etablissement.coge],
            provinceId: etablissement.provinceId
        });
        setIsEditing(false);
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

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            'DG': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
            'SGACAD': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
            'SGAD': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
            'SGR': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200',
            'AB': 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
        };
        return colors[role] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onBack}
                            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Retour à la liste
                        </button>
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {etablissement.designation}
                        </h2>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                                >
                                    {isLoading && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    Enregistrer
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Modifier
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-8">
                {/* Informations de base */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Nom et sigle */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nom de l'établissement
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {etablissement.designation}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sigle
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.sigle}
                                        onChange={(e) => setFormData(prev => ({ ...prev, sigle: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {etablissement.sigle}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Catégorie */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Catégorie
                            </label>
                            {isEditing ? (
                                <select
                                    value={formData.categorie}
                                    onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value as 'public' | 'privee' }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="public">Public</option>
                                    <option value="privee">Privé</option>
                                </select>
                            ) : (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    etablissement.categorie === 'public' 
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                                }`}>
                                    {etablissement.categorie === 'public' ? 'Public' : 'Privé'}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                />
                            ) : (
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {etablissement.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Logo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Logo de l'établissement
                        </label>
                        {isEditing ? (
                            <ImageUploader
                                currentImageUrl={formData.logo}
                                onImageUploaded={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                                onImageRemoved={() => setFormData(prev => ({ ...prev, logo: '' }))}
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                {etablissement.logo ? (
                                    <img 
                                        src={etablissement.logo} 
                                        alt={etablissement.designation}
                                        className="w-full h-full object-contain rounded-lg"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Aucun logo</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* COGE */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Comité de Gestion (COGE)
                        </h3>
                        {isEditing && (
                            <button
                                onClick={addCogeMembre}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                            >
                                + Ajouter un membre
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {(isEditing ? formData.coge : etablissement.coge).map((membre, index) => (
                            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                {isEditing ? (
                                    <>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={membre.membreId}
                                                onChange={(e) => updateCogeMembre(index, 'membreId', e.target.value)}
                                                placeholder="ID du membre"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div className="w-32">
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
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                Membre ID: {membre.membreId}
                                            </span>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRoleColor(membre.role)}`}>
                                            {membre.role}
                                        </span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EtablissementDetail;
