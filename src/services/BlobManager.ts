import { put, del } from "@vercel/blob";

class BlobManager {
    private token: string;

    constructor(tokenVercel: string) {
        this.token = tokenVercel;
    }

    async createBlob(fileBlob: File, metadata?: Record<string, any>) {
        // La fonction put accepte (pathname, body, options)
        const result = await put(fileBlob.name, fileBlob, {
            access: "public",
            token: this.token,
            addRandomSuffix: true, // Recommandé pour éviter les conflits
        });
        
        // result contient { pathname, contentType, contentDisposition, url, downloadUrl }
        return {
            url: result.url,
            downloadUrl: result.downloadUrl,
            pathname: result.pathname,
            contentType: result.contentType,
            metadata: metadata || {}, // Les métadonnées ne sont pas stockées directement par Vercel Blob
        };
    }

    async getBlob(pathname: string) {
        // Vercel Blob n'a pas de méthode get() pour récupérer les métadonnées
        // Il faut utiliser l'URL directement pour télécharger le blob
        const response = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération du blob");
        }
        
        return {
            blob: await response.blob(),
            url: response.url,
        };
    }

    async deleteBlob(pathname: string) {
        const result = await del(pathname, {
            token: this.token,
        });
        
        return result;
    }
}

export default new BlobManager("vercel_blob_rw_UjimgJlxAOXHk6Kc_diCCt7m888bwt2Wsj1JMW9zEAbVKH6");