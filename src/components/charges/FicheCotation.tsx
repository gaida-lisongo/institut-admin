"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChargeWithDetails, Fiche } from '@/services/ChargeService';
import { Etudiant } from '@/types/etudiant';
import ChargeService from '@/services/ChargeService';

interface FicheCotationProps {
  charge: ChargeWithDetails;
  onBack: () => void;
}

export default function FicheCotation({ charge, onBack }: FicheCotationProps) {
  const [fiches, setFiches] = useState<Fiche[]>(charge.fiches);
  const [filteredFiches, setFilteredFiches] = useState<Fiche[]>(charge.fiches);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OK' | 'PENDING' | 'NO'>('ALL');

  // Filtrage des fiches
  useEffect(() => {
    let filtered = fiches;
    
    // Filtrage par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(fiche => {
        const etudiant = fiche.etudiantId as Etudiant;
        const fullName = `${etudiant.nom} ${etudiant.post_nom} ${etudiant.prenom}`.toLowerCase();
        const matricule = etudiant.matricule?.toLowerCase() || '';
        const reference = fiche.reference?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || matricule.includes(search) || reference.includes(search);
      });
    }
    
    // Filtrage par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(fiche => fiche.status === statusFilter);
    }
    
    setFilteredFiches(filtered);
  }, [fiches, searchTerm, statusFilter]);

  // Sauvegarde automatique avec calcul du status
  const autoSaveFiche = async (ficheId: string, field: 'cmi' | 'examen' | 'rattrapage', value: number) => {
    const fiche = fiches.find(f => f._id === ficheId);
    if (!fiche) return;
    
    const updatedData = { ...fiche, [field]: value };
    const total = calculateTotal(updatedData.cmi || 0, updatedData.examen || 0, updatedData.rattrapage || 0);
    
    // Calcul automatique du status
    const newStatus = total >= 10 ? 'OK' : 'PENDING';
    
    setLoading(true);
    try {
      await ChargeService.updateFiche(ficheId, {
        [field]: value,
        status: newStatus
      });
      
      // Mettre à jour la liste locale
      setFiches(prev => prev.map(f => 
        f._id === ficheId ? { ...f, [field]: value, status: newStatus } : f
      ));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des changements de notes avec sauvegarde automatique
  const handleNoteChange = (ficheId: string, field: 'cmi' | 'examen' | 'rattrapage', value: string) => {
    const numValue = parseFloat(value) || 0;
    
    // Mise à jour immédiate de l'affichage
    setFiches(prev => prev.map(f => 
      f._id === ficheId ? { ...f, [field]: numValue } : f
    ));
    
    // Sauvegarde automatique après un délai
    setTimeout(() => {
      autoSaveFiche(ficheId, field, numValue);
    }, 1000); // 1 seconde de délai
  };

  const getEtudiantInfo = (etudiant: Etudiant | string) => {
    if (typeof etudiant === 'string') {
      return { fullName: etudiant, matricule: 'N/A' };
    }
    const fullName = `${etudiant.nom} ${etudiant.post_nom} ${etudiant.prenom}`;
    return { fullName, matricule: etudiant.matricule || 'N/A' };
  };

  const calculateTotal = (cmi: number = 0, examen: number = 0, rattrapage: number = 0) => {
    // Nouveau système: CMI=10pts, Examen=10pts, Rattrapage=20pts
    // Si rattrapage existe, il remplace complètement les autres notes
    if (rattrapage > 0) {
      return Math.round(rattrapage * 100) / 100;
    }
    // Sinon: CMI + Examen
    return Math.round((cmi + examen) * 100) / 100;
  };

  const getGradeColor = (total: number) => {
    if (total >= 16) return 'text-green-600 dark:text-green-400';
    if (total >= 14) return 'text-blue-600 dark:text-blue-400';
    if (total >= 12) return 'text-yellow-600 dark:text-yellow-400';
    if (total >= 10) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="p-6">
      {/* Header avec bouton retour */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux charges
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {charge.cours.titre}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {charge.cours.description} • {charge.annee.debut} - {charge.annee.fin}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {fiches.filter(f => f.status === 'OK').length} / {fiches.length} étudiants cotés
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {fiches.length > 0 ? Math.round((fiches.filter(f => f.status === 'OK').length / fiches.length) * 100) : 0}% terminé
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Affichage: {filteredFiches.length} / {fiches.length}
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rechercher un étudiant
            </label>
            <input
              type="text"
              placeholder="Nom, prénom, matricule ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrer par statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'OK' | 'PENDING' | 'NO')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">En cours</option>
              <option value="OK">Terminé</option>
              <option value="NO">Non évalué</option>
            </select>
          </div>
        </div>
      </div>

      {/* Légende des notes */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Système de notation - Sauvegarde automatique
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">CMI (10 pts)</span>
            <p className="text-blue-600 dark:text-blue-400">Contrôle Moyen Intégré</p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Examen (10 pts)</span>
            <p className="text-blue-600 dark:text-blue-400">Note d'examen final</p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Rattrapage (20 pts)</span>
            <p className="text-blue-600 dark:text-blue-400">Remplace CMI + Examen - Status auto: OK si ≥10</p>
          </div>
        </div>
      </div>

      {/* Liste des étudiants */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Liste des étudiants ({filteredFiches.length})
            </h3>
            {loading && (
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Sauvegarde...
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CMI (/10)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Examen (/10)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rattrapage (/20)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total (/20)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFiches.map((fiche) => {
                const total = calculateTotal(
                  fiche.cmi || 0,
                  fiche.examen || 0,
                  fiche.rattrapage || 0
                );
                const etudiantInfo = getEtudiantInfo(fiche.etudiantId);

                return (
                  <tr key={fiche._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {etudiantInfo.fullName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Matricule: {etudiantInfo.matricule}
                      </div>
                      <div className="text-xs text-gray-400">
                        Réf: {fiche.reference || 'N/A'}
                      </div>
                    </td>
                    
                    {/* CMI */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fiche.status === 'PENDING' ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.25"
                          value={fiche.cmi || ''}
                          onChange={(e) => handleNoteChange(fiche._id!, 'cmi', e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {fiche.cmi || '-'}
                        </span>
                      )}
                    </td>
                    
                    {/* Examen */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fiche.status === 'PENDING' ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.25"
                          value={fiche.examen || ''}
                          onChange={(e) => handleNoteChange(fiche._id!, 'examen', e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {fiche.examen || '-'}
                        </span>
                      )}
                    </td>
                    
                    {/* Rattrapage */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fiche.status === 'PENDING' ? (
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          value={fiche.rattrapage || ''}
                          onChange={(e) => handleNoteChange(fiche._id!, 'rattrapage', e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {fiche.rattrapage || '-'}
                        </span>
                      )}
                    </td>
                    
                    {/* Total */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getGradeColor(total)}`}>
                        {total > 0 ? total.toFixed(2) : '-'}
                      </span>
                    </td>
                    
                    {/* Statut */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        fiche.status === 'OK' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : fiche.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {fiche.status}
                      </span>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {fiche.status === 'PENDING' ? (
                        <span className="text-green-600 dark:text-green-400 text-xs flex items-center">
                          ✏️ Éditable
                          {loading && <div className="ml-1 animate-spin rounded-full h-3 w-3 border-b border-green-600"></div>}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">
                          🔒 Lecture seule
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
