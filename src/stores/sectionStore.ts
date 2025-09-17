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
  
  // Actions pour les offres
  addOffreToSection: (sectionId: string, offre: Offre) => Promise<boolean>;
  updateOffreInSection: (sectionId: string, offreIndex: number, offre: Offre) => Promise<boolean>;
  removeOffreFromSection: (sectionId: string, offreIndex: number) => Promise<boolean>;
  
  // Actions pour les calendriers
  addCalendrierToSection: (sectionId: string, calendrier: Calendrier) => Promise<boolean>;
  updateCalendrierInSection: (sectionId: string, calendrierIndex: number, calendrier: Calendrier) => Promise<boolean>;
  removeCalendrierFromSection: (sectionId: string, calendrierIndex: number) => Promise<boolean>;
  
  // Actions pour les activités dans les calendriers
  updateActivitiesInCalendrier: (sectionId: string, calendrierIndex: number, activities: Activity[]) => Promise<boolean>;
  
  // Actions pour le mot du chef
  updateMotChefInSection: (sectionId: string, motChef: MotChef) => Promise<boolean>;
  
  // Actions pour les missions
  addMissionToSection: (sectionId: string, mission: Mission) => Promise<boolean>;
  updateMissionInSection: (sectionId: string, missionIndex: number, mission: Mission) => Promise<boolean>;
  removeMissionFromSection: (sectionId: string, missionIndex: number) => Promise<boolean>;
  
  // Actions pour les valeurs
  updateValeursInSection: (sectionId: string, valeurs: string[]) => Promise<boolean>;
  
  // Actions pour l'historique
  addHistoryToSection: (sectionId: string, history: History) => Promise<boolean>;
  updateHistoryInSection: (sectionId: string, historyIndex: number, history: History) => Promise<boolean>;
  removeHistoryFromSection: (sectionId: string, historyIndex: number) => Promise<boolean>;
  
  // Actions pour les alumni
  addAlumnToSection: (sectionId: string, alumn: Alumn) => Promise<boolean>;
  updateAlumnInSection: (sectionId: string, alumnIndex: number, alumn: Alumn) => Promise<boolean>;
  removeAlumnFromSection: (sectionId: string, alumnIndex: number) => Promise<boolean>;
  
  // Actions pour l'équipe
  addTeamMemberToSection: (sectionId: string, teamMember: Team) => Promise<boolean>;
  updateTeamMemberInSection: (sectionId: string, teamIndex: number, teamMember: Team) => Promise<boolean>;
  removeTeamMemberFromSection: (sectionId: string, teamIndex: number) => Promise<boolean>;

  // Action pour le contact
  updateContactInSection: (sectionId: string, contact: Contact) => Promise<boolean>;

  
  // Selectors
  getSectionById: (id: string) => Section | undefined;
  getSectionBysigle: (sigle: string) => Section | undefined;
  getAllOffres: () => { sectionId: string, sectionName: string, offre: Offre, index: number }[];
  getOffresBySectionId: (sectionId: string) => Offre[];
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

        // Méthodes pour gérer les offres
        addOffreToSection: async (sectionId, offre) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedSection = {
              ...section,
              offres: [...section.offres, offre]
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de l\'ajout de l\'offre',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout de l\'offre',
              isLoading: false 
            });
            return false;
          }
        },

        updateOffreInSection: async (sectionId, offreIndex, offre) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedOffres = [...section.offres];
            updatedOffres[offreIndex] = offre;

            const updatedSection = {
              ...section,
              offres: updatedOffres
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la modification de l\'offre',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la modification de l\'offre',
              isLoading: false 
            });
            return false;
          }
        },

        removeOffreFromSection: async (sectionId, offreIndex) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedOffres = section.offres.filter((_, index) => index !== offreIndex);

            const updatedSection = {
              ...section,
              offres: updatedOffres
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la suppression de l\'offre',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'offre',
              isLoading: false 
            });
            return false;
          }
        },

        getAllOffres: () => {
          const sections = get().sections;
          const offres: { sectionId: string, sectionName: string, offre: Offre, index: number }[] = [];
          
          sections.forEach(section => {
            section.offres.forEach((offre, index) => {
              offres.push({
                sectionId: section._id || '',
                sectionName: section.description.sigle,
                offre,
                index
              });
            });
          });
          
          return offres;
        },

        getOffresBySectionId: (sectionId) => {
          const section = get().sections.find(s => s._id === sectionId);
          return section ? section.offres : [];
        },

        // Méthodes pour gérer les calendriers
        addCalendrierToSection: async (sectionId, calendrier) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedSection = {
              ...section,
              calendrier: [...section.calendrier, calendrier]
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de l\'ajout du calendrier',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du calendrier',
              isLoading: false 
            });
            return false;
          }
        },

        updateCalendrierInSection: async (sectionId, calendrierIndex, calendrier) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedCalendriers = [...section.calendrier];
            updatedCalendriers[calendrierIndex] = calendrier;

            const updatedSection = {
              ...section,
              calendrier: updatedCalendriers
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la modification du calendrier',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la modification du calendrier',
              isLoading: false 
            });
            return false;
          }
        },

        removeCalendrierFromSection: async (sectionId, calendrierIndex) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedCalendriers = section.calendrier.filter((_, index) => index !== calendrierIndex);

            const updatedSection = {
              ...section,
              calendrier: updatedCalendriers
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la suppression du calendrier',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la suppression du calendrier',
              isLoading: false 
            });
            return false;
          }
        },

        // Méthode pour mettre à jour les activités dans un calendrier
        updateActivitiesInCalendrier: async (sectionId, calendrierIndex, activities) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedCalendriers = [...section.calendrier];
            updatedCalendriers[calendrierIndex] = {
              ...updatedCalendriers[calendrierIndex],
              activities
            };

            const updatedSection = {
              ...section,
              calendrier: updatedCalendriers
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la modification des activités',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la modification des activités',
              isLoading: false 
            });
            return false;
          }
        },

        // Méthode pour gérer le mot du chef
        updateMotChefInSection: async (sectionId, motChef) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedSection = {
              ...section,
              description: {
                ...section.description,
                motChef
              }
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la modification du mot du chef',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la modification du mot du chef',
              isLoading: false 
            });
            return false;
          }
        },

        // Méthodes pour gérer les missions
        addMissionToSection: async (sectionId, mission) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedSection = {
              ...section,
              missions: [...section.missions, mission]
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de l\'ajout de la mission',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout de la mission',
              isLoading: false 
            });
            return false;
          }
        },

        updateMissionInSection: async (sectionId, missionIndex, mission) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedMissions = [...section.missions];
            updatedMissions[missionIndex] = mission;

            const updatedSection = {
              ...section,
              missions: updatedMissions
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la modification de la mission',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la modification de la mission',
              isLoading: false 
            });
            return false;
          }
        },

        removeMissionFromSection: async (sectionId, missionIndex) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedMissions = section.missions.filter((_, index) => index !== missionIndex);

            const updatedSection = {
              ...section,
              missions: updatedMissions
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la suppression de la mission',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la mission',
              isLoading: false 
            });
            return false;
          }
        },

        // Méthodes pour gérer les valeurs  
        updateValeursInSection: async (sectionId, valeurs) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedSection = {
              ...section,
              valeurs
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la modification des valeurs',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la modification des valeurs',
              isLoading: false 
            });
            return false;
          }
        },

        // Méthodes pour gérer l'historique
        addHistoryToSection: async (sectionId, history) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedSection = {
              ...section,
              history: [...section.history, history]
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de l\'ajout de l\'historique',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout de l\'historique',
              isLoading: false 
            });
            return false;
          }
        },

        updateHistoryInSection: async (sectionId, historyIndex, history) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedHistory = [...section.history];
            updatedHistory[historyIndex] = history;

            const updatedSection = {
              ...section,
              history: updatedHistory
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la modification de l\'historique',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la modification de l\'historique',
              isLoading: false 
            });
            return false;
          }
        },

        removeHistoryFromSection: async (sectionId, historyIndex) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedHistory = section.history.filter((_, index) => index !== historyIndex);

            const updatedSection = {
              ...section,
              history: updatedHistory
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la suppression de l\'historique',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'historique',
              isLoading: false 
            });
            return false;
          }
        },

        // Méthodes pour gérer les alumni
        addAlumnToSection: async (sectionId, alumn) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedSection = {
              ...section,
              alumni: [...section.alumni, alumn]
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de l\'ajout de l\'alumni',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout de l\'alumni',
              isLoading: false 
            });
            return false;
          }
        },

        updateAlumnInSection: async (sectionId, alumnIndex, alumn) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedAlumni = [...section.alumni];
            updatedAlumni[alumnIndex] = alumn;

            const updatedSection = {
              ...section,
              alumni: updatedAlumni
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la modification de l\'alumni',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la modification de l\'alumni',
              isLoading: false 
            });
            return false;
          }
        },

        removeAlumnFromSection: async (sectionId, alumnIndex) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedAlumni = section.alumni.filter((_, index) => index !== alumnIndex);

            const updatedSection = {
              ...section,
              alumni: updatedAlumni
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la suppression de l\'alumni',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'alumni',
              isLoading: false 
            });
            return false;
          }
        },

        // Méthodes pour gérer l'équipe
        addTeamMemberToSection: async (sectionId, teamMember) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedSection = {
              ...section,
              team: [...section.team, teamMember]
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de l\'ajout du membre de l\'équipe',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du membre de l\'équipe',
              isLoading: false 
            });
            return false;
          }
        },

        updateTeamMemberInSection: async (sectionId, teamIndex, teamMember) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedTeam = [...section.team];
            updatedTeam[teamIndex] = teamMember;

            const updatedSection = {
              ...section,
              team: updatedTeam
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);

            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s =>
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({
                error: result.data?.message || 'Erreur lors de la modification du membre de l\'équipe',
                isLoading: false
              });
              return false;
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Erreur lors de la modification du membre de l\'équipe',
              isLoading: false
            });
            return false;
          }
        },

        // Méthode pour mettre à jour le contact d'une section
        updateContactInSection: async (sectionId: string, contact: Contact): Promise<boolean> => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedSection = {
              ...section,
              contact
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s =>
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({
                error: result.data?.message || 'Erreur lors de la modification du contact',
                isLoading: false
              });
              return false;
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Erreur lors de la modification du contact',
              isLoading: false
            });
            return false;
          }
        },

        removeTeamMemberFromSection: async (sectionId, teamIndex) => {
          set({ isLoading: true, error: null });
          try {
            const section = get().sections.find(s => s._id === sectionId);
            if (!section) {
              set({ error: 'Section non trouvée', isLoading: false });
              return false;
            }

            const updatedTeam = section.team.filter((_, index) => index !== teamIndex);

            const updatedSection = {
              ...section,
              team: updatedTeam
            };

            const result = await SectionService.updateSection(sectionId, updatedSection);
            
            if (result.status === 200 && result.data.success) {
              set(state => ({
                sections: state.sections.map(s => 
                  s._id === sectionId ? result.data.data : s
                ),
                isLoading: false
              }));
              return true;
            } else {
              set({ 
                error: result.data?.message || 'Erreur lors de la suppression du membre de l\'équipe',
                isLoading: false 
              });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la suppression du membre de l\'équipe',
              isLoading: false 
            });
            return false;
          }
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