"use client";

import React, { useState, useEffect } from 'react';
import { ChargeWithDetails, Fiche } from '@/services/ChargeService';
import ChargeService from '@/services/ChargeService';

interface FicheCotationProps {
  charge: ChargeWithDetails;
  onBack: () => void;
}

export default function FicheCotation({ charge, onBack }: FicheCotationProps) {
  const [fiches, setFiches] = useState<Fiche[]>(charge.fiches);
  const [loading, setLoading] = useState(false);
  const [editingFiche, setEditingFiche] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Fiche>>({});

  // ChargeService est déjà une instance

  const handleEditFiche = (fiche: Fiche) => {
    setEditingFiche(fiche._id || '');
    setFormData({
      cmi: fiche.cmi || 0,
      examen: fiche.examen || 0,
      rattrapage: fiche.rattrapage || 0,
      status: fiche.status || 'PENDING'
    });
  };

  const handleSaveFiche = async (ficheId: string) => {
    if (!ficheId) return;
    
    setLoading(true);
    try {
      const updatedFiche = await ChargeService.updateFiche(ficheId, formData);
      
      // Mettre à jour la liste locale
      setFiches(prev => prev.map(f => 
        f._id === ficheId ? { ...f, ...updatedFiche } : f
      ));
      
      setEditingFiche(null);
      setFormData({});
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingFiche(null);
    setFormData({});
  };

  const getEtudiantName = (etudiant: any) => {
    if (typeof etudiant === 'string') return etudiant;
    return `${etudiant.nom} ${etudiant.prenom}` || 'Étudiant inconnu';
  };

  const calculateTotal = (cmi: number = 0, examen: number = 0, rattrapage: number = 0) => {
    // Si rattrapage existe, on prend le meilleur entre examen et rattrapage
    const finalExam = rattrapage > 0 ? Math.max(examen, rattrapage) : examen;
    return Math.round(((cmi * 0.4) + (finalExam * 0.6)) * 100) / 100;
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
          </div>
        </div>
      </div>

      {/* Légende des notes */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Système de notation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">CMI (40%)</span>
            <p className="text-blue-600 dark:text-blue-400">Contrôle Moyen Intégré</p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Examen (60%)</span>
            <p className="text-blue-600 dark:text-blue-400">Note d'examen final</p>
          </div>
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">Rattrapage</span>
            <p className="text-blue-600 dark:text-blue-400">Remplace l'examen si meilleur</p>
          </div>
        </div>
      </div>

      {/* Liste des étudiants */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Liste des étudiants ({fiches.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CMI (/20)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Examen (/20)
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
              {fiches.map((fiche) => {
                const isEditing = editingFiche === fiche._id;
                const total = calculateTotal(
                  isEditing ? (formData.cmi || 0) : (fiche.cmi || 0),
                  isEditing ? (formData.examen || 0) : (fiche.examen || 0),
                  isEditing ? (formData.rattrapage || 0) : (fiche.rattrapage || 0)
                );

                return (
                  <tr key={fiche._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getEtudiantName(fiche.etudiantId)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Réf: {fiche.reference || 'N/A'}
                      </div>
                    </td>
                    
                    {/* CMI */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          value={formData.cmi || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, cmi: parseFloat(e.target.value) || 0 }))}
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
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          value={formData.examen || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, examen: parseFloat(e.target.value) || 0 }))}
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
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          value={formData.rattrapage || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, rattrapage: parseFloat(e.target.value) || 0 }))}
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
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveFiche(fiche._id!)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                          >
                            ✓ Sauver
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={loading}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
                          >
                            ✕ Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditFiche(fiche)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          ✏️ Modifier
                        </button>
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
