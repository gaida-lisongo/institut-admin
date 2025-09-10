import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import SectionService from '../services/SectionService';

// Types basés sur votre schéma MongoDB
interface Offre {
  icon: string;
  titre: string;
  description: string;
}

interface Activity {
  titre: string;
  date_activity: Date;
  description: string;
}

interface Calendrier {
  annee: string;
  current: boolean;
  activities: Activity[];
}

interface Alumn {
  photo: string;
  nom: string;
  titre: string;
  description: string;
}

interface Event {
  photo: string;
  titre: string;
  description: string;
}

interface Galery {
  annee: string;
  current: boolean;
  events: Event[];
}

interface AgendaEvent {
  date_event: Date;
  titre: string;
  description: string;
}

interface Agenda {
  annee: string;
  current: boolean;
  events: AgendaEvent[];
}

interface Mission {
  titre: string;
  description: string;
}

interface History {
  date_event: Date;
  titre: string;
  description: string;
}

interface Team {
  photo: string;
  nom: string;
  grade: string;
  fonction: string;
}

interface MotChef {
  photo?: string;
  description?: string;
}

interface Description {
  sigle: string;
  designation: string;
  devise: string;
  objectif: string;
  images: string[];
  motChef?: MotChef;
}

interface Contact {
  addresse: string;
  telephone: string;
  email: string;
  www?: string;
}

interface Section {
  _id?: string;
  description: Description;
  offres: Offre[];
  calendrier: Calendrier[];
  alumni: Alumn[];
  galery: Galery[];
  agenda: Agenda[];
  missions: Mission[];
  history: History[];
  team: Team[];
  valeurs: string[];
  contact: Contact;
  createdAt?: string;
  updatedAt?: string;
}

interface SectionState {
  sections: Section[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSections: () => Promise<void>;
  createSection: (sectionData: Omit<Section, '_id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateSection: (id: string, sectionData: Partial<Section>) => Promise<boolean>;
  deleteSection: (id: string) => Promise<boolean>;
  clearError: () => void;
  
  // Selectors
  getSectionById: (id: string) => Section | undefined;
  getSectionBysigle: (sigle: string) => Section | undefined;
}

export const useSectionStore = create<SectionState>()(
  devtools(
    persist(
      (set, get) => ({
        sections: [],
        isLoading: false,
        error: null,

        fetchSections: async () => {
          set({ isLoading: true, error: null });
          try {
            const result = await SectionService.getAllSections();
            if (result.status === 200) {
              const { success, data } = result.data;
              if (success) {
                set({ sections: data || [], isLoading: false });
              } else {
                set({ 
                  error: result.data.message || 'Erreur lors du chargement',
                  isLoading: false 
                });
              }
            } else {
              set({ 
                error: result.data.message || 'Erreur lors du chargement',
                isLoading: false 
              });
            }
          } catch (error) {
            console.error('Error fetching sections:', error);
            set({ 
              error: 'Erreur lors du chargement des sections',
              isLoading: false 
            });
          }
        },

        createSection: async (sectionData) => {
          set({ error: null });
          try {
            const result = await SectionService.createSection(sectionData);
            if (result.data.success) {
              // Recharger les sections après création
              await get().fetchSections();
              return true;
            } else {
              set({ error: result.data.message || 'Erreur lors de la création' });
              return false;
            }
          } catch (error) {
            console.error('Error creating section:', error);
            set({ error: 'Erreur lors de la création de la section' });
            return false;
          }
        },

        updateSection: async (id, sectionData) => {
          set({ error: null });
          try {
            const result = await SectionService.updateSection(id, sectionData);
            if (result.data.success) {
              // Recharger les sections après modification
              await get().fetchSections();
              return true;
            } else {
              set({ error: result.data.message || 'Erreur lors de la modification' });
              return false;
            }
          } catch (error) {
            console.error('Error updating section:', error);
            set({ error: 'Erreur lors de la modification de la section' });
            return false;
          }
        },

        deleteSection: async (id) => {
          set({ error: null });
          try {
            const result = await SectionService.deleteSection(id);
            if (result.data.success) {
              // Recharger les sections après suppression
              await get().fetchSections();
              return true;
            } else {
              set({ error: result.data.message || 'Erreur lors de la suppression' });
              return false;
            }
          } catch (error) {
            console.error('Error deleting section:', error);
            set({ error: 'Erreur lors de la suppression de la section' });
            return false;
          }
        },

        clearError: () => set({ error: null }),

        getSectionById: (id) => {
          return get().sections.find(section => section._id === id);
        },

        getSectionBysigle: (sigle) => {
          return get().sections.find(section => section.description.sigle === sigle);
        },
      }),
      {
        name: 'section-storage',
        partialize: (state) => ({ sections: state.sections }), // Persist seulement les sections
      }
    ),
    {
      name: 'section-store',
    }
  )
);

export type { Section, Description, Contact, Offre, Activity, Calendrier, Alumn, Event, Galery, AgendaEvent, Agenda, Mission, History, Team, MotChef };