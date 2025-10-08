
class BlobManager {
    private apiUrl: string;

    constructor() {
        this.apiUrl = '/api'; // Utilise les API routes locales
    }

    // private getAuthHeaders(): HeadersInit {
    //     const token = useAuthStore.getState().token;
    //     return {
    //         ...(token && { "Authorization": `Bearer ${token}` }),
    //     };
    // }

    async createBlob(fileBlob: File, metadata?: Record<string, any>) {
        const formData = new FormData();
        formData.append('file', fileBlob);
        if (metadata) {
            formData.append('metadata', JSON.stringify(metadata));
        }

        const response = await fetch(`${this.apiUrl}/upload`, {
            method: 'POST',
            // headers: this.getAuthHeaders(),
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'upload du blob');
        }

        return await response.json();
    }

    async getBlob(pathname: string) {
        // Pour récupérer un blob, on utilise directement son URL
        const response = await fetch(pathname);
        
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération du blob');
        }
        
        return {
            blob: await response.blob(),
            url: pathname,
        };
    }

    async deleteBlob(pathname: string) {
        const response = await fetch(`${this.apiUrl}/blob?pathname=${encodeURIComponent(pathname)}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression du blob');
        }

        return await response.json();
    }
}

export default new BlobManager();