"use client";
import React, { useState, useEffect } from "react";
import { ChargeWithDetails, ChargeFormData } from "@/services/ChargeService";
import { useChargeStore } from "@/stores/chargeStore";
import { useAgentStore } from "@/stores/agentStore";
import { useCoursStore } from "@/stores/coursStore";
import { useAnneeStore } from "@/stores/anneeStore";

interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  charge?: ChargeWithDetails;
  preselectedCoursId?: string;
}

export default function ChargeModal({ isOpen, onClose, charge, preselectedCoursId }: ChargeModalProps) {
  const { createCharge, updateCharge, loading } = useChargeStore();
  const { agents, fetchAgents } = useAgentStore();
  const { cours, fetchCours } = useCoursStore();
  const { annees, fetchAnnees } = useAnneeStore();

  const [formData, setFormData] = useState<ChargeFormData>({
    agentId: "",
    coursId: preselectedCoursId || "",
    anneeId: ""
  });

  const [errors, setErrors] = useState<Partial<ChargeFormData>>({});

  // Chargement des données nécessaires
  useEffect(() => {
    if (isOpen) {
      fetchAgents();
      fetchCours();
      fetchAnnees();
    }
  }, [isOpen, fetchAgents, fetchCours, fetchAnnees]);

  // Pré-remplir le formulaire si on modifie une charge
  useEffect(() => {
    if (charge) {
      setFormData({
        agentId: charge.agentId,
        coursId: charge.coursId,
        anneeId: charge.anneeId
      });
    } else {
      setFormData({
        agentId: "",
        coursId: preselectedCoursId || "",
        anneeId: ""
      });
    }
    setErrors({});
  }, [charge, preselectedCoursId]);

  // Sélectionner automatiquement l'année courante
  useEffect(() => {
    if (annees.length > 0 && !charge && !formData.anneeId) {
      const currentYear = new Date().getFullYear();
      const currentAnnee = annees.find(a => a.debut <= currentYear && a.fin >= currentYear);
      if (currentAnnee) {
        setFormData(prev => ({ ...prev, anneeId: currentAnnee._id || "" }));
      }
    }
  }, [annees, charge, formData.anneeId]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ChargeFormData> = {};

    if (!formData.agentId) {
      newErrors.agentId = "Veuillez sélectionner un enseignant";
    }
    if (!formData.coursId) {
      newErrors.coursId = "Veuillez sélectionner un cours";
    }
    if (!formData.anneeId) {
      newErrors.anneeId = "Veuillez sélectionner une année";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (charge?._id) {
        await updateCharge(charge._id, formData);
      } else {
        await createCharge(formData);
      }
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleChange = (field: keyof ChargeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">
                    {charge ? "✏️" : "➕"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {charge ? "Modifier la charge horaire" : "Créer une charge horaire"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Assignez un cours à un enseignant pour une année académique
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Sélection du cours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cours *
                </label>
                <select
                  value={formData.coursId}
                  onChange={(e) => handleChange("coursId", e.target.value)}
                  className={`block w-full px-3 py-2 border ${
                    errors.coursId ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                  disabled={!!preselectedCoursId}
                >
                  <option value="">Sélectionner un cours</option>
                  {cours.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.titre} ({c.credit} crédit{c.credit > 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
                {errors.coursId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.coursId}</p>
                )}
              </div>

              {/* Sélection de l'enseignant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enseignant *
                </label>
                <select
                  value={formData.agentId}
                  onChange={(e) => handleChange("agentId", e.target.value)}
                  className={`block w-full px-3 py-2 border ${
                    errors.agentId ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                >
                  <option value="">Sélectionner un enseignant</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.prenom} {agent.nom} {agent.grade && `(${agent.grade})`}
                    </option>
                  ))}
                </select>
                {errors.agentId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.agentId}</p>
                )}
              </div>

              {/* Sélection de l'année */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Année académique *
                </label>
                <select
                  value={formData.anneeId}
                  onChange={(e) => handleChange("anneeId", e.target.value)}
                  className={`block w-full px-3 py-2 border ${
                    errors.anneeId ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                >
                  <option value="">Sélectionner une année</option>
                  {annees.map((annee) => (
                    <option key={annee._id} value={annee._id}>
                      {annee.debut} - {annee.fin}
                    </option>
                  ))}
                </select>
                {errors.anneeId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.anneeId}</p>
                )}
              </div>

              {/* Prévisualisation */}
              {formData.agentId && formData.coursId && formData.anneeId && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    📝 Résumé de la charge horaire
                  </h4>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <div>
                      <strong>Cours:</strong> {cours.find(c => c._id === formData.coursId)?.titre}
                    </div>
                    <div>
                      <strong>Enseignant:</strong> {
                        (() => {
                          const agent = agents.find(a => a._id === formData.agentId);
                          return agent ? `${agent.prenom} ${agent.nom}` : '';
                        })()
                      }
                    </div>
                    <div>
                      <strong>Année:</strong> {
                        (() => {
                          const annee = annees.find(a => a._id === formData.anneeId);
                          return annee ? `${annee.debut} - ${annee.fin}` : '';
                        })()
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{charge ? "Modification..." : "Création..."}</span>
                  </div>
                ) : (
                  charge ? "Modifier" : "Créer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}