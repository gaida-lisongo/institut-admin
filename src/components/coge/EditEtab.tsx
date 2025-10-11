'use client';

import Image from 'next/image';
import { Upload, Building2, Edit2, Save, X } from 'lucide-react';

interface EditEtabProps {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    designation: string;
    setDesignation: (value: string) => void;
    sigle: string;
    setSigle: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    logo: string;
    setLogo: (value: string) => void;
    displayLogo: string;
    isUploadingLogo: boolean;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSave: () => void;
    handleCancel: () => void;
    isSaving: boolean;
}

const EditEtab = ({
    isEditing,
    setIsEditing,
    designation,
    setDesignation,
    sigle,
    setSigle,
    description,
    setDescription,
    displayLogo,
    isUploadingLogo,
    handleLogoUpload,
    handleSave,
    handleCancel,
    isSaving
}: EditEtabProps) => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Barre d'actions */}
            <div className="mb-6 flex justify-end gap-3">
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Modifier les informations
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="w-4 h-4" />
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isUploadingLogo}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Enregistrer
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations principales */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Carte Désignation */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Désignation
                        </h2>
                        {isEditing ? (
                            <input
                                type="text"
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nom complet de l'établissement"
                            />
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300">
                                {designation}
                            </p>
                        )}
                    </div>

                    {/* Carte Sigle */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Sigle
                        </h2>
                        {isEditing ? (
                            <input
                                type="text"
                                value={sigle}
                                onChange={(e) => setSigle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Sigle de l'établissement"
                            />
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300">
                                {sigle}
                            </p>
                        )}
                    </div>

                    {/* Carte Description */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Description
                        </h2>
                        {isEditing ? (
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Description de l'établissement"
                            />
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Sidebar - Logo */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Logo de l'établissement
                        </h2>
                        <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                            {displayLogo ? (
                                <Image
                                    src={displayLogo}
                                    alt={sigle}
                                    width={400}
                                    height={400}
                                    className="w-full h-full object-contain p-4"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Building2 className="w-24 h-24 text-gray-400" />
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <label className="block w-full">
                                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                                    {isUploadingLogo ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Upload...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Changer le logo
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    disabled={isUploadingLogo}
                                />
                            </label>
                        )}
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                            Format: PNG, JPG, SVG (max 5MB)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditEtab;
