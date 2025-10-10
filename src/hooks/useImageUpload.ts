import { useState } from 'react';
import BlobManager from '@/services/BlobManager';

interface UseImageUploadOptions {
    maxSize?: number; // en bytes
    allowedTypes?: string[];
    metadata?: Record<string, any>;
}

interface UseImageUploadReturn {
    isUploading: boolean;
    error: string | null;
    uploadImage: (file: File) => Promise<string | null>;
    deleteImage: (url: string) => Promise<void>;
    clearError: () => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
    const {
        maxSize = 5 * 1024 * 1024, // 5MB par défaut
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        metadata = {}
    } = options;

    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File): boolean => {
        if (!allowedTypes.includes(file.type)) {
            setError(`Type de fichier non supporté. Types acceptés: ${allowedTypes.join(', ')}`);
            return false;
        }

        if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            setError(`Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`);
            return false;
        }

        return true;
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        setError(null);
        
        if (!validateFile(file)) {
            return null;
        }

        setIsUploading(true);

        try {
            const result = await BlobManager.createBlob(file, {
                type: 'image',
                originalName: file.name,
                size: file.size,
                mimeType: file.type,
                ...metadata
            });

            if (!result.url) {
                throw new Error('URL non reçue du serveur');
            }

            return result.url;
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const deleteImage = async (url: string): Promise<void> => {
        try {
            await BlobManager.deleteBlob(url);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            // On ne lance pas d'erreur pour la suppression car ce n'est pas critique
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        isUploading,
        error,
        uploadImage,
        deleteImage,
        clearError
    };
};

export default useImageUpload;
