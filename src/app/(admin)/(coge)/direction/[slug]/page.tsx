'use client';

import { useParams } from 'next/navigation';
import { useEtablissementStore } from '@/stores/etablissementStore';
import { EtablissementPopulated } from '@/types/etablissement';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Upload, Building2 } from 'lucide-react';
import BlobManager from '@/services/BlobManager';
import NavigationCoge from '@/components/coge/Navigation';

export default function DirectionPage() {
    const params = useParams();
    const etablissementId = params.slug as string;
    const { etablissements, fetchEtablissements, isLoading, updateEtablissement } = useEtablissementStore();
    const [selectedEtablissement, setSelectedEtablissement] = useState<EtablissementPopulated | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    
    // États pour les champs éditables
    const [designation, setDesignation] = useState('');
    const [sigle, setSigle] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState('');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchEtablissements();
    }, [fetchEtablissements]);

    useEffect(() => {
        const etablissement = etablissements.find((e) => e._id === etablissementId);
        if (etablissement) {
            setSelectedEtablissement(etablissement);
            setDesignation(etablissement.designation);
            setSigle(etablissement.sigle);
            setDescription(etablissement.description);
            setLogo(etablissement.logo);
        }
    }, [etablissements, etablissementId]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation du type de fichier
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide');
            return;
        }

        // Validation de la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La taille du fichier ne doit pas dépasser 5MB');
            return;
        }

        try {
            setIsUploadingLogo(true);
            
            // Prévisualisation
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload vers le serveur
            const result = await BlobManager.createBlob(file, {
                etablissementId,
                type: 'logo'
            });

            if (result.url) {
                setLogo(result.url);
            }
        } catch (error) {
            console.error('Erreur upload logo:', error);
            alert('Erreur lors de l\'upload du logo');
            setLogoPreview(null);
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleSave = async () => {
        if (!selectedEtablissement?._id) return;

        try {
            setIsSaving(true);

            const updatedData = {
                designation,
                sigle,
                description,
                logo
            };

            const result = await updateEtablissement(selectedEtablissement._id, updatedData);

            if (result) {
                // Mise à jour locale immédiate
                setSelectedEtablissement({
                    ...selectedEtablissement,
                    ...updatedData
                });
                setIsEditing(false);
                setLogoPreview(null);
                alert('Informations mises à jour avec succès');
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (selectedEtablissement) {
            setDesignation(selectedEtablissement.designation);
            setSigle(selectedEtablissement.sigle);
            setDescription(selectedEtablissement.description);
            setLogo(selectedEtablissement.logo);
            setLogoPreview(null);
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!selectedEtablissement) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Établissement introuvable</p>
                </div>
            </div>
        );
    }

    const displayLogo = logoPreview || logo;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Bannière avec logo */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-lg bg-white dark:bg-gray-800 p-2 shadow-lg">
                                {displayLogo ? (
                                    <Image
                                        src={displayLogo}
                                        alt={sigle}
                                        width={88}
                                        height={88}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Building2 className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors">
                                    <Upload className="w-4 h-4" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        disabled={isUploadingLogo}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Informations */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white">
                                {designation}
                            </h1>
                            <p className="mt-1 text-xl text-blue-100">
                                {sigle}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation avec onglets */}
            <NavigationCoge
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                designation={designation}
                setDesignation={setDesignation}
                sigle={sigle}
                setSigle={setSigle}
                description={description}
                setDescription={setDescription}
                logo={logo}
                setLogo={setLogo}
                displayLogo={displayLogo}
                isUploadingLogo={isUploadingLogo}
                handleLogoUpload={handleLogoUpload}
                handleSave={handleSave}
                handleCancel={handleCancel}
                isSaving={isSaving}
                etablissementId={etablissementId}
            />
        </div>
    );
}