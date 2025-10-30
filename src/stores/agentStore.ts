// src/store/useAgentStore.ts (ou .js si vous n'utilisez pas TypeScript)

import { create } from "zustand";
import { persist } from "zustand/middleware";
// Assurez-vous que le chemin d'importation du type Agent est correct
import { Agent } from "@/types/userTypes"; 

// URL de base de votre API (à remplacer par votre variable d'environnement)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'; 

// --- Interface du Store (Déjà fournie par l'utilisateur) ---
interface AgentStore {
    agents: Agent[];
    agentsLoading: boolean;
    agentsError: string | null;
    fetchAgents: (page?: number, limit?: number, search?: string) => Promise<Agent[]>;
    addAgent: (agent: Agent) => Promise<Agent>;
    updateAgent: (agent: Agent) => Promise<Agent>;
    deleteAgent: (id: string) => Promise<void>;
    setAgents: (agents: Agent[]) => void;
}

// --- Implémentation du Store ---
export const useAgentStore = create<AgentStore>()(
    persist(
        (set, get) => ({
            // --- État Initial ---
            agents: [],
            agentsLoading: false,
            agentsError: null,

            // --- Méthodes de Mutation Directe ---
            setAgents: (agents: Agent[]) => set({ agents }),

            // --- Méthodes API ---

            /**
             * Récupère la liste des agents (avec pagination/recherche)
             */
            fetchAgents: async (page = 1, limit = 1000) => {
                set({ agentsLoading: true, agentsError: null });
                try {
                    // Construction de l'URL avec les paramètres de requête
                    const url = new URL(`${API_BASE_URL}/users`);
                    url.searchParams.append('page', page.toString());
                    url.searchParams.append('limit', limit.toString());
                    
                    // TODO: Ajouter le token d'authentification dans l'en-tête
                    const request = await fetch(url.toString());

                    if (!request.ok) {
                        throw new Error(`Erreur lors de la récupération des agents: ${request.statusText}`);
                    }
                    
                    const response = await request.json();
                    
                    if(!response.success){
                        throw new Error(response.message);
                    }

                    const { data, message } = response;
                    console.log("Data response : ", data);
                    console.log("Message response : ", message);

                    const fetchedAgents: Agent[] = data.users || []; // Assurez-vous que le chemin correspond à votre réponse API
                    
                    set({ agents: fetchedAgents, agentsLoading: false });
                    return fetchedAgents;
                } catch (error: any) {
                    set({ agentsLoading: false, agentsError: error.message });
                    throw error;
                }
            },

            /**
             * Ajoute un nouvel agent
             */
            addAgent: async (agentData) => {
                set({ agentsLoading: true, agentsError: null });
                try {
                    const response = await fetch(`${API_BASE_URL}/users`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(agentData)
                    });

                    if (!response.ok) {
                        const errorBody = await response.json();
                        throw new Error(errorBody.message || `Erreur d'ajout: ${response.statusText}`);
                    }

                    const {data} = await response.json();
                    const newAgent: Agent = data;
                    // Mise à jour de l'état local
                    set((state) => ({
                        agents: [newAgent, ...state.agents],
                        agentsLoading: false,
                    }));
                    return newAgent;
                } catch (error: any) {
                    set({ agentsLoading: false, agentsError: error.message });
                    throw error;
                }
            },

            /**
             * Met à jour un agent existant
             */
            updateAgent: async (updatedAgent) => {
                 set({ agentsLoading: true, agentsError: null });
                try {
                    // Utilisation de l'identifiant (matricule ou _id) pour l'URL
                    const response = await fetch(`${API_BASE_URL}/users/${updatedAgent?._id}`, { 
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedAgent)
                    });

                    if (!response.ok) {
                        const errorBody = await response.json();
                        throw new Error(errorBody.message || `Erreur de mise à jour: ${response.statusText}`);
                    }
                    
                    const {data} = await response.json();
                    const returnedAgent: Agent = data;
                    
                    // Mise à jour de l'état local
                    set((state) => ({
                        agents: state.agents.map(a => 
                            a.matricule === returnedAgent.matricule ? returnedAgent : a
                        ),
                        agentsLoading: false,
                    }));
                    return returnedAgent;

                } catch (error: any) {
                    set({ agentsLoading: false, agentsError: error.message });
                    throw error;
                }
            },

            /**
             * Supprime un agent par son identifiant
             */
            deleteAgent: async (id: string) => {
                set({ agentsLoading: true, agentsError: null });
                try {
                    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                        method: 'DELETE',
                        // TODO: Ajouter le token d'authentification
                    });

                    if (!response.ok) {
                         const errorBody = await response.json();
                        throw new Error(errorBody.message || `Erreur de suppression: ${response.statusText}`);
                    }

                    // Suppression de l'état local
                    set((state) => ({
                        agents: state.agents.filter(a => a?._id !== id),
                        agentsLoading: false,
                    }));

                } catch (error: any) {
                    set({ agentsLoading: false, agentsError: error.message });
                    throw error;
                }
            }
        }),
        {
            name: 'agent-storage', // Clé unique dans localStorage
            // Recommandation: n'inclure que les états légers et critiques si nécessaire.
            // Ici, nous n'incluons rien car la liste des agents ne devrait pas être persistée.
            partialize: (state) => ({}), 
            // Si vous voulez persister un petit état de configuration (par ex. le mode d'affichage) :
            // partialize: (state) => ({ configMode: state.configMode }) 
        }
    )
);