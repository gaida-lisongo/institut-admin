import { Agent, AgentFormData } from "@/types/agent";
import { LoginResponse } from "@/types/auth";
import { PasswordUtils } from "@/utils/passwordUtils";
import useAuthStore from "@/stores/authStore";

const API_BASE_URL = "https://legendary-barnacle.onrender.com/api/v1/user";

export class AgentService {

  // Fonction helper pour obtenir les headers d'authentification
  private static getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  }

  // Authentification de l'agent/utilisateur
  static async login(matricule: string, password: string): Promise<LoginResponse> {
    try {
      // Crypter le mot de passe avec SHA1 avant de l'envoyer
      const hashedPassword = PasswordUtils.hashPassword(password);
      
      const response = await fetch(`${API_BASE_URL}/agent/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matricule,
          password: password, // Utiliser le mot de passe crypté
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      
      return result as LoginResponse;
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error);
      throw error;
    }
  }
  
  // Récupérer tous les agents
  static async getAgents(): Promise<Agent[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/agent`, {
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des agents:", error);
      throw error;
    }
  }

  // Récupérer un agent spécifique
  static async getAgent(id: string): Promise<Agent> {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/${id}`, {
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération de l'agent:", error);
      throw error;
    }
  }

  // Créer un nouvel agent
  static async createAgent(agentData: AgentFormData): Promise<Agent> {
    try {
      // Crypter le mot de passe avec SHA1
      const hashedPassword = PasswordUtils.hashPassword(agentData.secure);
      
      const response = await fetch(`${API_BASE_URL}/agent`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          ...agentData,
          secure: hashedPassword, // Utiliser le mot de passe crypté
          date_naissance: new Date(agentData.date_naissance),
          solde: Number(agentData.solde),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création de l'agent:", error);
      throw error;
    }
  }

  // Mettre à jour un agent
  static async updateAgent(id: string, agentData: Partial<AgentFormData>): Promise<Agent> {
    try {
      const updateData: any = { ...agentData };
      
      // Crypter le mot de passe avec SHA1 s'il est fourni
      if (updateData.secure) {
        updateData.secure = PasswordUtils.hashPassword(updateData.secure);
      }
      
      // Convertir les types si nécessaire
      if (updateData.date_naissance) {
        updateData.date_naissance = new Date(updateData.date_naissance);
      }
      if (updateData.solde !== undefined) {
        updateData.solde = Number(updateData.solde);
      }

      const response = await fetch(`${API_BASE_URL}/agent/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'agent:", error);
      throw error;
    }
  }

  // Supprimer un agent
  static async deleteAgent(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'agent:", error);
      throw error;
    }
  }

  // Créer plusieurs agents via CSV
  static async createAgentsFromCSV(agents: AgentFormData[]): Promise<Agent[]> {
    try {
      const createdAgents: Agent[] = [];
      
      // Créer les agents un par un pour éviter les conflits
      for (const agentData of agents) {
        try {
          // Les mots de passe seront automatiquement cryptés par createAgent
          const agent = await this.createAgent(agentData);
          createdAgents.push(agent);
        } catch (error) {
          console.error(`Erreur lors de la création de l'agent ${agentData.nom}:`, error);
          // Continue avec les autres agents même si un échoue
        }
      }
      
      return createdAgents;
    } catch (error) {
      console.error("Erreur lors de l'import CSV:", error);
      throw error;
    }
  }

  // Générer un template CSV
  static generateCSVTemplate(): string {
    const headers = [
      'nom',
      'post_nom', 
      'prenom',
      'sexe',
      'nationalite',
      'lieu_naissance',
      'date_naissance',
      'matricule',
      'secure',
      'solde',
      'grade',
      'titre'
    ];

    const exampleData = [
      'Dupont',
      'Martin',
      'Jean',
      'M',
      'Française',
      'Paris',
      '1990-01-15',
      'MAT001',
      'MotDePasse123!',
      '2500',
      'Adjoint',
      'Monsieur'
    ];

    const comments = [
      '# Template CSV pour import d\'agents',
      '# IMPORTANT: Les mots de passe seront automatiquement cryptés en SHA1',
      '# Format de date: YYYY-MM-DD',
      '# Sexe: M ou F',
      '# Solde: nombre décimal',
      ''
    ];

    return [
      comments.join('\n'),
      headers.join(','),
      exampleData.join(',')
    ].join('\n');
  }

  // Télécharger le template CSV
  static downloadCSVTemplate(): void {
    const csvContent = this.generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'template-agents.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Parser un fichier CSV
  static parseCSV(csvText: string): AgentFormData[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('Le fichier CSV doit contenir au moins une ligne de données');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const agents: AgentFormData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        console.warn(`Ligne ${i + 1} ignorée: nombre de colonnes incorrect`);
        continue;
      }

      const agent: AgentFormData = {
        nom: values[0] || '',
        post_nom: values[1] || '',
        prenom: values[2] || '',
        sexe: (values[3] === 'M' || values[3] === 'F') ? values[3] : '',
        nationalite: values[4] || '',
        lieu_naissance: values[5] || '',
        date_naissance: values[6] || '',
        matricule: values[7] || '',
        secure: values[8] || '',
        solde: parseFloat(values[9]) || 0,
        grade: values[10] || '',
        titre: values[11] || ''
      };

      // Validation basique
      if (agent.nom && agent.prenom && agent.matricule) {
        agents.push(agent);
      } else {
        console.warn(`Ligne ${i + 1} ignorée: données manquantes`);
      }
    }

    return agents;
  }
}
