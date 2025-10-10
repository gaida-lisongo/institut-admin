'use client';

import { useState, useRef } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploaderProps {
    currentImageUrl?: string;
    onImageUploaded: (url: string) => void;
    onImageRemoved: () => void;
    className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    currentImageUrl,
    onImageUploaded,
    onImageRemoved,
    className = ''
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { isUploading, error, uploadImage, deleteImage, clearError } = useImageUpload({
        metadata: { type: 'systeme-image' }
    });

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        clearError();

        try {
            // Créer une preview locale
            const localPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl(localPreviewUrl);

            // Upload via hook
            const uploadedUrl = await uploadImage(file);

            // Nettoyer la preview locale
            URL.revokeObjectURL(localPreviewUrl);

            if (uploadedUrl) {
                setPreviewUrl(uploadedUrl);
                onImageUploaded(uploadedUrl);
            } else {
                setPreviewUrl(currentImageUrl || null);
            }
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            setPreviewUrl(currentImageUrl || null);
        }
    };

    const handleRemoveImage = async () => {
        if (previewUrl && previewUrl !== currentImageUrl) {
            await deleteImage(previewUrl);
        }
        
        setPreviewUrl(null);
        clearError();
        onImageRemoved();
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Image du système
                </label>
                {previewUrl && (
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isUploading}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
                    >
                        Supprimer
                    </button>
                )}
            </div>

            {/* Zone d'upload/preview */}
            <div className="relative">
                {previewUrl ? (
                    // Preview de l'image
                    <div className="relative group">
                        <img
                            src={previewUrl}
                            alt="Preview du système"
                            className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        
                        {/* Overlay avec actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={triggerFileSelect}
                                    disabled={isUploading}
                                    className="px-3 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {isUploading ? 'Upload...' : 'Changer'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    disabled={isUploading}
                                    className="px-3 py-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>

                        {/* Indicateur de chargement */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <div className="flex items-center space-x-2 text-white">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    <span className="text-sm font-medium">Upload en cours...</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Zone de drop/sélection
                    <div
                        onClick={triggerFileSelect}
                        className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Upload en cours...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-2">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Cliquez pour sélectionner une image
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        PNG, JPG, GIF jusqu'à 5MB
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input file caché */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
            />

            {/* Message d'erreur */}
            {error && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Aide */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>• Formats supportés: JPG, PNG, GIF</p>
                <p>• Taille maximale: 5MB</p>
                <p>• Dimensions recommandées: 800x600px ou plus</p>
            </div>
        </div>
    );
};

export default ImageUploader;
