import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Agent, AgentFormData } from "@/types/agent";
import { AgentService } from "@/services/AgentService";

interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAgents: () => Promise<void>;
  fetchAgent: (id: string) => Promise<void>;
  createAgent: (agentData: AgentFormData) => Promise<Agent>;
  updateAgent: (id: string, agentData: Partial<AgentFormData>) => Promise<Agent>;
  deleteAgent: (id: string) => Promise<void>;
  creditSolde: (id: string, montant: number) => Promise<void>;
  createAgentsFromCSV: (agents: AgentFormData[]) => Promise<Agent[]>;
  setSelectedAgent: (agent: Agent | null) => void;
  clearError: () => void;
  setError: (error: string) => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agents: [],
      selectedAgent: null,
      isLoading: false,
      error: null,
      creditSolde: async (id: string, montant: number) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAgent = await AgentService.creditAgentAccount(id, montant);
          const { solde } = updatedAgent;
          if (solde === undefined) {
            throw new Error("Solde non défini dans la réponse de l'API");
          }
          
          set(state => ({
            agents: state.agents.map(agent => 
              agent._id === id ? { ...agent, solde } : agent
            ),
            selectedAgent: state.selectedAgent?._id === id ? { ...state.selectedAgent, solde } : state.selectedAgent,
            isLoading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors du crédit du solde";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },
      fetchAgents: async () => {
        set({ isLoading: true, error: null });
        try {
          const agents = await AgentService.getAgents();
          set({ agents, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Erreur lors du chargement des agents",
            isLoading: false 
          });
        }
      },

      fetchAgent: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const agent = await AgentService.getAgent(id);
          set({ selectedAgent: agent, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Erreur lors du chargement de l'agent",
            isLoading: false 
          });
        }
      },

      createAgent: async (agentData: AgentFormData) => {
        set({ isLoading: true, error: null });
        try {
          const newAgent = await AgentService.createAgent(agentData);
          set(state => ({ 
            agents: [...state.agents, newAgent],
            isLoading: false 
          }));
          return newAgent;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création de l'agent";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      updateAgent: async (id: string, agentData: Partial<AgentFormData>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAgent = await AgentService.updateAgent(id, agentData);
          set(state => ({
            agents: state.agents.map(agent => 
              agent._id === id ? updatedAgent : agent
            ),
            selectedAgent: state.selectedAgent?._id === id ? updatedAgent : state.selectedAgent,
            isLoading: false
          }));
          return updatedAgent;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'agent";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      deleteAgent: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await AgentService.deleteAgent(id);
          set(state => ({
            agents: state.agents.filter(agent => agent._id !== id),
            selectedAgent: state.selectedAgent?._id === id ? null : state.selectedAgent,
            isLoading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression de l'agent";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      createAgentsFromCSV: async (agentsData: AgentFormData[]) => {
        set({ isLoading: true, error: null });
        try {
          const createdAgents = await AgentService.createAgentsFromCSV(agentsData);
          set(state => ({
            agents: [...state.agents, ...createdAgents],
            isLoading: false
          }));
          return createdAgents;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'import CSV";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      setSelectedAgent: (agent: Agent | null) => {
        set({ selectedAgent: agent });
      },

      clearError: () => {
        set({ error: null });
      },

      setError: (error: string) => {
        set({ error });
      },
    }),
    {
      name: "agent-store",
      partialize: (state) => ({ 
        agents: state.agents,
        selectedAgent: state.selectedAgent 
      }),
    }
  )
);
