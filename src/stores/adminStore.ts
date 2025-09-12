import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Admin, AdminWithAgent, AdminMetrics, AdminFilters, CreateAdminRequest, UpdateAdminRequest } from '@/types/admin';

interface AdminState {
  // State
  admins: AdminWithAgent[];
  currentAdmin: AdminWithAgent | null;
  metrics: AdminMetrics | null;
  filters: AdminFilters;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedRole: string;
  quotiteRange: [number, number];
  isCurrentUserAdmin: boolean;

  // Actions
  setAdmins: (admins: AdminWithAgent[]) => void;
  addAdmin: (admin: AdminWithAgent) => void;
  updateAdmin: (id: string, admin: Partial<AdminWithAgent>) => void;
  deleteAdmin: (id: string) => void;
  setCurrentAdmin: (admin: AdminWithAgent | null) => void;
  setMetrics: (metrics: AdminMetrics) => void;
  setFilters: (filters: Partial<AdminFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchTerm: (term: string) => void;
  setSelectedRole: (role: string) => void;
  setQuotiteRange: (range: [number, number]) => void;
  setIsCurrentUserAdmin: (isAdmin: boolean) => void;
  clearError: () => void;
  resetFilters: () => void;
  
  // Computed
  getFilteredAdmins: () => AdminWithAgent[];
  getUniqueRoles: () => string[];
  calculateMetrics: () => AdminMetrics;
}

const initialFilters: AdminFilters = {
  search: '',
  role: '',
  quotiteMin: 0,
  quotiteMax: 100,
};

const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Initial state
      admins: [],
      currentAdmin: null,
      metrics: null,
      filters: initialFilters,
      loading: false,
      error: null,
      searchTerm: '',
      selectedRole: '',
      quotiteRange: [0, 100],
      isCurrentUserAdmin: false,

      // Actions
      setAdmins: (admins) => {
        set({ admins });
        // Recalculer les métriques automatiquement
        const metrics = get().calculateMetrics();
        set({ metrics });
      },

      addAdmin: (admin) => {
        const currentAdmins = get().admins;
        const newAdmins = [...currentAdmins, admin];
        set({ admins: newAdmins });
        const metrics = get().calculateMetrics();
        set({ metrics });
      },

      updateAdmin: (id, updatedAdmin) => {
        const currentAdmins = get().admins;
        const newAdmins = currentAdmins.map(admin => 
          admin._id === id ? { ...admin, ...updatedAdmin } : admin
        );
        set({ admins: newAdmins });
        const metrics = get().calculateMetrics();
        set({ metrics });
      },

      deleteAdmin: (id) => {
        const currentAdmins = get().admins;
        const newAdmins = currentAdmins.filter(admin => admin._id !== id);
        set({ admins: newAdmins });
        const metrics = get().calculateMetrics();
        set({ metrics });
      },

      setCurrentAdmin: (admin) => set({ currentAdmin: admin }),
      setMetrics: (metrics) => set({ metrics }),
      setFilters: (filters) => set(state => ({ filters: { ...state.filters, ...filters } })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      setSelectedRole: (role) => set({ selectedRole: role }),
      setQuotiteRange: (range) => set({ quotiteRange: range }),
      setIsCurrentUserAdmin: (isAdmin) => set({ isCurrentUserAdmin: isAdmin }),
      clearError: () => set({ error: null }),

      resetFilters: () => set({ 
        filters: initialFilters,
        searchTerm: '',
        selectedRole: '',
        quotiteRange: [0, 100]
      }),

      // Computed functions
      getFilteredAdmins: () => {
        const { admins, searchTerm, selectedRole, quotiteRange } = get();
        
        return admins.filter(admin => {
          // Filtre de recherche (nom, prénom, matricule, email)
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const agent = admin.userId;
            const matchesSearch = 
              agent.nom.toLowerCase().includes(searchLower) ||
              agent.prenom.toLowerCase().includes(searchLower) ||
              agent.post_nom.toLowerCase().includes(searchLower) ||
              agent.matricule.toLowerCase().includes(searchLower) ||
              (agent.email && agent.email.toLowerCase().includes(searchLower));
            
            if (!matchesSearch) return false;
          }

          // Filtre par rôle
          if (selectedRole && selectedRole !== '' && admin.role !== selectedRole) {
            return false;
          }

          // Filtre par quotité
          const [minQuotite, maxQuotite] = quotiteRange;
          if (admin.quotite < minQuotite || admin.quotite > maxQuotite) {
            return false;
          }

          return true;
        });
      },

      getUniqueRoles: () => {
        const { admins } = get();
        const roles = [...new Set(admins.map(admin => admin.role))];
        return roles.sort();
      },

      calculateMetrics: (): AdminMetrics => {
        const { admins } = get();
        
        if (admins.length === 0) {
          return {
            total: 0,
            totalQuotite: 0,
            averageQuotite: 0,
            roleDistribution: {}
          };
        }

        const totalQuotite = admins.reduce((sum, admin) => sum + admin.quotite, 0);
        const averageQuotite = totalQuotite / admins.length;
        
        const roleDistribution = admins.reduce((acc, admin) => {
          acc[admin.role] = (acc[admin.role] || 0) + 1;
          return acc;
        }, {} as { [role: string]: number });

        return {
          total: admins.length,
          totalQuotite,
          averageQuotite: Math.round(averageQuotite * 100) / 100,
          roleDistribution
        };
      }
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({
        admins: state.admins,
        isCurrentUserAdmin: state.isCurrentUserAdmin,
        metrics: state.metrics
      })
    }
  )
);

export default useAdminStore;