import { Etudiant, EtudiantFormData } from "@/types/etudiant";
import { PasswordUtils } from "@/utils/passwordUtils";
import useAuthStore from "@/stores/authStore";
import config from "./config.json";

const API_BASE_URL = `${config.API_BASE_URL}/etudiant`;

export class EtudiantService {

  // Fonction helper pour obtenir les headers d'authentification
  private static getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  }

  // Récupérer tous les étudiants
  static async getEtudiants(): Promise<Etudiant[]> {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des étudiants:", error);
      throw error;
    }
  }

  // Récupérer un étudiant spécifique
  static async getEtudiant(id: string): Promise<Etudiant> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Réponse de l'API pour getEtudiant:", data);
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération de l'étudiant:", error);
      throw error;
    }
  }

  // Créer un nouvel étudiant
  static async createEtudiant(etudiantData: EtudiantFormData): Promise<Etudiant> {
    try {
      // Crypter le mot de passe avec SHA1
      const hashedPassword = PasswordUtils.hashPassword(etudiantData.secure);
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          ...etudiantData,
          secure: hashedPassword, // Utiliser le mot de passe crypté
          date_naissance: new Date(etudiantData.date_naissance),
          solde: Number(etudiantData.solde),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText || 'Erreur inconnue'}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création de l'étudiant:", error);
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la création: ${error.message}`);
      }
      throw error;
    }
  }

  // Mettre à jour un étudiant
  static async updateEtudiant(id: string, etudiantData: Partial<EtudiantFormData>): Promise<Etudiant> {
    try {
      const updateData: any = { ...etudiantData };
      
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

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'étudiant:", error);
      throw error;
    }
  }

  // Supprimer un étudiant
  static async deleteEtudiant(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'étudiant:", error);
      throw error;
    }
  }

  // Créer plusieurs étudiants via CSV
  static async createEtudiantsFromCSV(etudiants: EtudiantFormData[]): Promise<Etudiant[]> {
    try {
      const createdEtudiants: Etudiant[] = [];
      
      // Créer les étudiants un par un pour éviter les conflits
      for (const etudiantData of etudiants) {
        try {
          // Les mots de passe seront automatiquement cryptés par createEtudiant
          const etudiant = await this.createEtudiant(etudiantData);
          createdEtudiants.push(etudiant);
        } catch (error) {
          console.error(`Erreur lors de la création de l'étudiant ${etudiantData.nom}:`, error);
          // Continue avec les autres étudiants même si un échoue
        }
      }
      
      return createdEtudiants;
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
      'solde'
    ];

    const exampleData = [
      'Mukendi',
      'Kalala',
      'Jean',
      'M',
      'Congolaise',
      'Kinshasa',
      '2000-05-15',
      'ETU001',
      'MotDePasse123!',
      '50000'
    ];

    const comments = [
      '# Template CSV pour import d\'étudiants',
      '# IMPORTANT: Les mots de passe seront automatiquement cryptés en SHA1',
      '# Format de date: YYYY-MM-DD',
      '# Sexe: M ou F',
      '# Solde: nombre décimal (en CDF)',
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
    link.setAttribute('download', 'template-etudiants.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Parser un fichier CSV
  static parseCSV(csvText: string): EtudiantFormData[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('Le fichier CSV doit contenir au moins une ligne de données');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const etudiants: EtudiantFormData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        console.warn(`Ligne ${i + 1} ignorée: nombre de colonnes incorrect`);
        continue;
      }

      const etudiant: EtudiantFormData = {
        nom: values[0] || '',
        post_nom: values[1] || '',
        prenom: values[2] || '',
        sexe: (values[3] === 'M' || values[3] === 'F') ? values[3] : '',
        nationalite: values[4] || '',
        lieu_naissance: values[5] || '',
        date_naissance: values[6] || '',
        matricule: values[7] || '',
        secure: values[8] || '',
        solde: parseFloat(values[9]) || 0
      };

      // Validation basique
      if (etudiant.nom && etudiant.prenom && etudiant.matricule) {
        etudiants.push(etudiant);
      } else {
        console.warn(`Ligne ${i + 1} ignorée: données manquantes`);
      }
    }

    return etudiants;
  }

  static exportEtudiantsToCSV(etudiants: Etudiant[]): void {
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
      'photo',
      'created_at'
    ];

    const csvContent = [
      headers.join(','),
      ...etudiants.map(etudiant => [
        etudiant.nom,
        etudiant.post_nom,
        etudiant.prenom,
        etudiant.sexe,
        etudiant.nationalite,
        etudiant.lieu_naissance,
        etudiant.date_naissance instanceof Date 
          ? etudiant.date_naissance.toISOString().split('T')[0]
          : etudiant.date_naissance,
        etudiant.matricule,
        etudiant.secure,
        etudiant.solde,
        etudiant.photo || '',
        etudiant.created_at 
          ? (etudiant.created_at instanceof Date 
              ? etudiant.created_at.toISOString().split('T')[0]
              : new Date(etudiant.created_at).toISOString().split('T')[0])
          : new Date().toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `etudiants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
