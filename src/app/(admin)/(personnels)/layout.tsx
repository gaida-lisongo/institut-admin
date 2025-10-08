import React from 'react';
import { Metadata } from 'next';
import { Personnel, PersonnelStats, PersonnelStatsApiResponse } from '@/types/personnel';
import PersonnelLayoutClient from '@/components/personnel/PersonnelLayoutClient';

const API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;

// Métadonnées pour la section personnel
export const metadata: Metadata = {
  title: 'Gestion du Personnel | Institut Admin',
  description: 'Administration et suivi des ressources humaines - Personnel académique, scientifique et administratif',
  keywords: ['personnel', 'ressources humaines', 'gestion', 'administration', 'académique', 'scientifique', 'administratif'],
  openGraph: {
    title: 'Gestion du Personnel',
    description: 'Administration et suivi des ressources humaines',
    type: 'website',
  },
};

// Fonction pour récupérer les données côté serveur
async function getPersonnelData(): Promise<{
  personnels: Personnel[];
  stats: PersonnelStats | null;
  error: string | null;
}> {
  try {
    // Récupération des personnels
    const personnelsResponse = await fetch(`${API_URL}/users`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Pas de cache pour avoir les données fraîches
      cache: 'no-store',
    });

    if (!personnelsResponse.ok) {
      throw new Error(`Erreur HTTP personnels: ${personnelsResponse.status}`);
    }

    const personnelsResult = await personnelsResponse.json();
    
    if (!personnelsResult.success || !Array.isArray(personnelsResult.data)) {
      throw new Error(personnelsResult.message || 'Erreur lors du chargement des personnels');
    }

    // Traitement des données pour ajouter les champs calculés
    const processedPersonnels: Personnel[] = personnelsResult.data.map((personnel: Personnel) => ({
      ...personnel,
      nomComplet: `${personnel.nom} ${personnel.post_nom} ${personnel.prenom}`,
      age: personnel.date_naissance ? 
        new Date().getFullYear() - new Date(personnel.date_naissance).getFullYear() : undefined
    }));

    // Récupération des statistiques
    let stats: PersonnelStats | null = null;
    try {
      const statsResponse = await fetch(`${API_URL}/users/stats/overview`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (statsResponse.ok) {
        const statsResult: PersonnelStatsApiResponse = await statsResponse.json();
        
        if (statsResult.success && statsResult.data) {
          // Calcul des statistiques par sexe côté serveur
          const parSexe = processedPersonnels.reduce(
            (acc, p) => {
              if (p.sexe === 'M') acc.M++;
              else if (p.sexe === 'F') acc.F++;
              return acc;
            },
            { M: 0, F: 0 }
          );

          // Calcul des nouveaux (ajoutés dans les 30 derniers jours)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const nouveaux = processedPersonnels.filter(p => 
            p.createdAt && new Date(p.createdAt) >= thirtyDaysAgo
          ).length;

          stats = {
            total: statsResult.data.totalUsers,
            parCategorie: {
              scientifique: statsResult.data.usersByCategory.find(cat => cat._id === 'SCIENTIFIQUE')?.count || 0,
              administratif: statsResult.data.usersByCategory.find(cat => cat._id === 'ADMINISTRATIF')?.count || 0,
              academique: statsResult.data.usersByCategory.find(cat => cat._id === 'ACADEMIQUE')?.count || 0,
              ouvrier: statsResult.data.usersByCategory.find(cat => cat._id === 'OUVRIER')?.count || 0,
            },
            parSexe,
            avecAutorisations: statsResult.data.usersWithAutorisations,
            sansAutorisations: statsResult.data.usersWithoutAutorisations,
            nouveaux,
            actifs: statsResult.data.totalUsers,
          };
        }
      }
    } catch (statsError) {
      console.error('Erreur lors du chargement des statistiques:', statsError);
      // Les statistiques ne sont pas critiques, on continue sans
    }

    return {
      personnels: processedPersonnels,
      stats,
      error: null,
    };
  } catch (error) {
    console.error('Erreur getPersonnelData:', error);
    return {
      personnels: [],
      stats: null,
      error: error instanceof Error ? error.message : 'Erreur lors du chargement des données',
    };
  }
}

interface PersonnelLayoutProps {
  children: React.ReactNode;
}

// Server Component - Layout principal
const PersonnelLayout: React.FC<PersonnelLayoutProps> = async ({ children }) => {
  // Récupération des données côté serveur
  const { personnels, stats, error } = await getPersonnelData();

  return (
    <PersonnelLayoutClient 
      initialPersonnels={personnels}
      initialStats={stats}
      initialError={error}
    >
      {children}
    </PersonnelLayoutClient>
  );
};

export default PersonnelLayout;