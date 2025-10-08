"use client";

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { usePersonnelContext } from '../../layout';
import { usePersonnelsByProvince } from '@/stores/personnelStore';
import { Personnel } from '@/types/personnel';

const PersonnelAdministratifProvincePage: React.FC = () => {
  const params = useParams();
  const provinceId = params?.slug as string;
  const { provinces } = usePersonnelContext();
  const { personnels: personnelsProvince } = usePersonnelsByProvince(provinceId);

  // Filtrer uniquement le personnel administratif de cette province
  const personnelsAdministratifs = useMemo(() => {
    return personnelsProvince.filter(p => p.type === 'Administratif');
  }, [personnelsProvince]);

  // Trouver les informations de la province
  const province = provinces.find(p => p._id === provinceId);

  // Statistiques pour cette province
  const stats = useMemo(() => {
    const total = personnelsAdministratifs.length;
    const actifs = personnelsAdministratifs.filter(p => p.statut === 'Actif').length;
    const salaireMoyen = total > 0 
      ? personnelsAdministratifs.reduce((sum, p) => sum + p.salaire, 0) / total 
      : 0;
    
    // Analyser les postes administratifs
    const postes = personnelsAdministratifs.reduce((acc, p) => {
      if (p.grade) {
        acc[p.grade] = (acc[p.grade] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Analyser l'ancienneté
    const anciennetes = personnelsAdministratifs.map(p => {
      const dateEmbauche = new Date(p.dateEmbauche);
      const today = new Date();
      return today.getFullYear() - dateEmbauche.getFullYear();
    });

    const ancienneteMoyenne = anciennetes.length > 0 
      ? anciennetes.reduce((sum, age) => sum + age, 0) / anciennetes.length 
      : 0;

    return { total, actifs, salaireMoyen, postes, ancienneteMoyenne };
  }, [personnelsAdministratifs]);

  if (!province) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Province non trouvée
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            La province demandée n'existe pas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête de la province */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Personnel Administratif - {province.designation}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestion du personnel administratif et de support
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Ajouter Personnel
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Personnel"
          value={stats.total}
          icon="👔"
          color="green"
        />
        <StatCard
          title="Personnel Actif"
          value={stats.actifs}
          icon="✅"
          color="blue"
        />
        <StatCard
          title="Salaire Moyen"
          value={`${Math.round(stats.salaireMoyen).toLocaleString()} FC`}
          icon="💰"
          color="yellow"
        />
        <StatCard
          title="Ancienneté Moyenne"
          value={`${Math.round(stats.ancienneteMoyenne)} ans`}
          icon="⏰"
          color="purple"
        />
      </div>

      {/* Répartition par postes */}
      {Object.keys(stats.postes).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Répartition par Postes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.postes).map(([poste, count]) => (
              <div key={poste} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {poste}
                </span>
                <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphique de répartition des salaires */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Analyse des Salaires
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.min(...personnelsAdministratifs.map(p => p.salaire)).toLocaleString()} FC
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Salaire Minimum</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(stats.salaireMoyen).toLocaleString()} FC
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Salaire Moyen</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.max(...personnelsAdministratifs.map(p => p.salaire)).toLocaleString()} FC
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Salaire Maximum</div>
          </div>
        </div>
      </div>

      {/* Liste du personnel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Liste du Personnel Administratif
          </h3>
        </div>
        <div className="p-6">
          {personnelsAdministratifs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👔</div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aucun personnel administratif
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Il n'y a pas encore de personnel administratif dans cette province.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personnelsAdministratifs.map((personnel) => (
                <PersonnelCard key={personnel._id} personnel={personnel} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant de carte statistique
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// Composant de carte personnel
interface PersonnelCardProps {
  personnel: Personnel;
}

const PersonnelCard: React.FC<PersonnelCardProps> = ({ personnel }) => {
  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateAnciennete = (dateEmbauche: string) => {
    const embauche = new Date(dateEmbauche);
    const today = new Date();
    return today.getFullYear() - embauche.getFullYear();
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Actif':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Inactif':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Suspendu':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
          {personnel.prenom.charAt(0)}{personnel.nom.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {personnel.prenom} {personnel.nom}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {personnel.email}
          </p>
          {personnel.grade && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
              {personnel.grade}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ancienneté: {calculateAnciennete(personnel.dateEmbauche)} ans
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(personnel.statut)}`}>
              {personnel.statut}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {calculateAge(personnel.dateNaissance)} ans
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Salaire: {personnel.salaire.toLocaleString()} FC
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelAdministratifProvincePage;
