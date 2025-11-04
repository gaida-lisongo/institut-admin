import { Etudiant } from "@/types/etudiant";
import config from "./config.json";
import useAuthStore from "@/stores/authStore";

export interface Resolution {
    _id: string;
    travailId: any;
    etudiantId: Etudiant;
    url: string;
    note?: number;
    createdAt?: string;
    updatedAt?: string;
    status: 'PENDING' | 'OK' | 'NO';
}

class TravailService {
    private static baseUrl : string = config.API_BASE_URL;
    private static endpoints = {
        all_resolutions: (travailId: string) => `${this.baseUrl}/resolution/travail/${travailId}`,
        update_resolution: (resolutionId: string) => `${this.baseUrl}/resolution/${resolutionId}`,
        delete_resolution: (resolutionId: string) => `${this.baseUrl}/resolution/${resolutionId}`,
    }

    private static getAuthHeaders(): HeadersInit {
        const token = useAuthStore.getState().token;
        return {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        };
    }

    static async fetchAllResolutions(travailId: string): Promise<any> {
        try {
            const req = await fetch(this.endpoints.all_resolutions(travailId), {
                headers: this.getAuthHeaders(),
            });

            if (!req.ok) {
                throw new Error(`HTTP error! status: ${req.status}`);
            }

            const res = await req.json();
            if(res.success){
                return res.data as Resolution[];
            }else{
                throw new Error(res.message);
            }
        } catch (error) {
            console.error("Erreur lors de la vérification de la résolution:", error);
            throw error;
        }
    }

    static async updateResolution(resolutionId: string, resolution: Partial<Resolution>): Promise<any> {
        try {
            const req = await fetch(this.endpoints.update_resolution(resolutionId), {
                method: "PUT",
                headers: this.getAuthHeaders(),
                body: JSON.stringify(resolution),
            });

            if (!req.ok) {
                throw new Error(`HTTP error! status: ${req.status}`);
            }

            const res = await req.json();
            if(res.success){
                return res.data as Resolution;
            }else{
                throw new Error(res.message);
            }
        } catch (error) {
            console.error("Erreur lors de la vérification de la résolution:", error);
            throw error;
        }
    }

    static async deleteResolution(resolutionId: string): Promise<any> {
        try {
            const req = await fetch(this.endpoints.delete_resolution(resolutionId), {
                method: "DELETE",
                headers: this.getAuthHeaders(),
            });

            if (!req.ok) {
                throw new Error(`HTTP error! status: ${req.status}`);
            }

            const res = await req.json();
            if(res.success){
                return res.message;
            }else{
                throw new Error(res.message);
            }
        } catch (error) {
            console.error("Erreur lors de la vérification de la résolution:", error);
            throw error;
        }
    }
}

export default TravailService;
