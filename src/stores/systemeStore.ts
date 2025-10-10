import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Systeme, SystemeFormData } from '@/types/systemes';

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;

interface SystemeState {
  // État des données
  systemes: Systeme[];
  currentSysteme: Systeme | null;
  loading: boolean;
  error: string | null;

  // Actions CRUD
  fetchSystemes: () => Promise<void>;
  getSystemeById: (id: string) => Promise<Systeme | null>;
  createSysteme: (data: SystemeFormData) => Promise<Systeme | null>;
  updateSysteme: (id: string, data: SystemeFormData) => Promise<Systeme | null>;
  deleteSysteme: (id: string) => Promise<void>;
  
  // Actions utilitaires
  clearError: () => void;
  setCurrentSysteme: (systeme: Systeme | null) => void;
}

export const useSystemeStore = create<SystemeState>()(
    devtools(
        persist(
            (set, get) => ({
                systemes: [],
                currentSysteme: null,
                loading: false,
                error: null,
                fetchSystemes: async () => {
                    set({ loading: true, error: null });
                    try {
                        const response = await fetch(`${API_URL}/systemes`);
                        const result = await response.json();
                        
                        if (!response.ok) {
                            throw new Error(result.message || 'Erreur lors de la récupération des systemes');
                        }

                        if (result.success) {
                            set({ 
                                systemes: result.data || [], 
                                loading: false 
                            });
                        } else {
                            throw new Error(result.message || 'Erreur lors de la récupération des systemes');
                        }
                    } catch (error) {
                        set({ 
                            error: error instanceof Error ? error.message : 'Erreur inconnue',
                            loading: false 
                        });
                    }
                },
                getSystemeById: async (id: string) => {
                    set({ loading: true, error: null });
                    try {
                        const filteredSystemes = get().systemes.filter(systeme => systeme._id === id);
                        if (filteredSystemes.length > 0) {
                            set({ 
                                currentSysteme: filteredSystemes[0],
                                loading: false 
                            });
                            return filteredSystemes[0];
                        } else {
                            throw new Error('Systeme non trouvée');
                        }
                    } catch (error) {
                        set({ 
                            error: error instanceof Error ? error.message : 'Erreur inconnue',
                            loading: false,
                            currentSysteme: null
                        });
                        return null;
                    }
                },
                createSysteme: async (data: SystemeFormData) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await fetch(`${API_URL}/systemes`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data),
                        });
                        
                        const result = await response.json();
                        
                        if (!response.ok) {
                            throw new Error(result.message || 'Erreur lors de la création du système');
                        }

                        if (result.success && result.data) {
                            const newSysteme = result.data;
                            set(state => ({ 
                                systemes: [...state.systemes, newSysteme],
                                currentSysteme: newSysteme,
                                loading: false 
                            }));
                            return newSysteme;
                        } else {
                            throw new Error(result.message || 'Erreur lors de la création du système');
                        }
                    } catch (error) {
                        set({ 
                            error: error instanceof Error ? error.message : 'Erreur inconnue',
                            loading: false 
                        });
                        return null;
                    }
                },
                
                updateSysteme: async (id: string, data: SystemeFormData) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await fetch(`${API_URL}/systemes/${id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data),
                        });
                        
                        const result = await response.json();
                        
                        if (!response.ok) {
                            throw new Error(result.message || 'Erreur lors de la mise à jour du système');
                        }

                        if (result.success && result.data) {
                            const updatedSysteme = result.data;
                            set(state => ({ 
                                systemes: state.systemes.map(s => s._id === id ? updatedSysteme : s),
                                currentSysteme: state.currentSysteme?._id === id ? updatedSysteme : state.currentSysteme,
                                loading: false 
                            }));
                            return updatedSysteme;
                        } else {
                            throw new Error(result.message || 'Erreur lors de la mise à jour du système');
                        }
                    } catch (error) {
                        set({ 
                            error: error instanceof Error ? error.message : 'Erreur inconnue',
                            loading: false 
                        });
                        return null;
                    }
                },
                
                deleteSysteme: async (id: string) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await fetch(`${API_URL}/systemes/${id}`, {
                            method: 'DELETE',
                        });
                        
                        const result = await response.json();
                        
                        if (!response.ok) {
                            throw new Error(result.message || 'Erreur lors de la suppression du système');
                        }

                        if (result.success) {
                            set(state => ({ 
                                systemes: state.systemes.filter(s => s._id !== id),
                                currentSysteme: state.currentSysteme?._id === id ? null : state.currentSysteme,
                                loading: false 
                            }));
                        } else {
                            throw new Error(result.message || 'Erreur lors de la suppression du système');
                        }
                    } catch (error) {
                        set({ 
                            error: error instanceof Error ? error.message : 'Erreur inconnue',
                            loading: false 
                        });
                    }
                },
                
                // Actions utilitaires
                clearError: () => {
                    set({ error: null });
                },
                
                setCurrentSysteme: (systeme: Systeme | null) => {
                    set({ currentSysteme: systeme });
                },
            }),
            {
                name: 'systeme-store',
                partialize: (state) => ({
                    systemes: state.systemes,
                    currentSysteme: state.currentSysteme
                })
            }
        ),
        {
            name: 'systeme-store'
        }
    )
)