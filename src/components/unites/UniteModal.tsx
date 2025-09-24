"use client";
import React, { useState, useEffect } from "react";
import { Unite, UniteFormData, Responsable } from "@/services/UniteService";
import { useUniteStore } from "@/stores/uniteStore";
import { useAnneeStore } from "@/stores/anneeStore"; // AJOUT du store des années
import { Agent } from "@/types/agent";
import { AgentService } from "@/services/AgentService";

interface UniteModalProps {
  isOpen: boolean;
  onClose: () => void;
  unite?: Unite;
  sectionId: string;
}

export default function UniteModal({ isOpen, onClose, unite, sectionId }: UniteModalProps) {
  const { createUnite, updateUnite, loading } = useUniteStore();
  // AJOUT: Utilisation du store des années
  const { annees, fetchAnnees, selectedAnnee, isLoading: anneesLoading } = useAnneeStore();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [formData, setFormData] = useState<UniteFormData>({
    semestreId: sectionId,
    responsable: [],
    descripteur: {
      mention: "",
      code: "",
      designation: "",
      credit: 0,
      type: "Obigatoire",
      prealables: [],
      objectif: [],
      competences: [],
      approches: [],
      evaluation: []
    },
    ressources: [],
    bibliographie: [],
    videographie: [],
    cours: []
  });

  const [selectedResponsable, setSelectedResponsable] = useState({
    titulaireId: "",
    anneeId: "" // MODIFICATION: Plus de valeur par défaut automatique
  });

  // AJOUT: Chargement des années au démarrage
  useEffect(() => {
    if (isOpen) {
      fetchAnnees();
    }
  }, [isOpen, fetchAnnees]);

  // MODIFICATION: Chargement des agents et sélection automatique de l'année courante
  useEffect(() => {
    const loadAgents = async () => {
      setLoadingAgents(true);
      try {
        const agentsList = await AgentService.getAgents();
        setAgents(agentsList);
      } catch (error) {
        console.error("Erreur lors du chargement des agents:", error);
      } finally {
        setLoadingAgents(false);
      }
    };

    if (isOpen) {
      loadAgents();
      
      // AJOUT: Sélectionner automatiquement l'année courante si disponible et pas d'unité existante
      if (!unite && annees.length > 0) {
        const currentYear = new Date().getFullYear().toString();
        const foundYear = annees.find(a => a.debut.toString() <= currentYear && a.fin.toString() >= currentYear);
        if (foundYear) {
          setSelectedResponsable(prev => ({
            ...prev,
            anneeId: foundYear._id || currentYear
          }));
        } else if (annees.length > 0) {
          // Si l'année courante n'existe pas, prendre la première disponible
          setSelectedResponsable(prev => ({
            ...prev,
            anneeId: annees[0]._id || ""
          }));
        }
      }
    }
  }, [isOpen, unite, annees]);

  useEffect(() => {
    if (unite) {
      // Convertir les cours en tableau d'IDs si nécessaire
      const coursIds = Array.isArray(unite.cours) 
        ? unite.cours.map(cours => typeof cours === 'string' ? cours : cours._id || '')
        : [];

      setFormData({
        semestreId: unite.semestreId,
        responsable: unite.responsable,
        descripteur: unite.descripteur,
        ressources: unite.ressources,
        bibliographie: unite.bibliographie,
        videographie: unite.videographie,
        cours: coursIds
      });
      
      // Pré-remplir le responsable s'il existe
      if (unite.responsable.length > 0) {
        const responsable = unite.responsable[0];
        setSelectedResponsable({
          titulaireId: responsable.titulaireId,
          anneeId: typeof responsable.anneeId === 'string' ? responsable.anneeId : responsable.anneeId._id || ''
        });
      }
    } else {
      // Reset form for new unit
      setFormData({
        semestreId: sectionId,
        responsable: [],
        descripteur: {
          mention: "",
          code: "",
          designation: "",
          credit: 0,
          type: "Obigatoire",
          prealables: [],
          objectif: [],
          competences: [],
          approches: [],
          evaluation: []
        },
        ressources: [],
        bibliographie: [],
        videographie: [],
        cours: []
      });
      setSelectedResponsable({
        titulaireId: "",
        anneeId: ""
      });
    }
  }, [unite, sectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Préparer les données avec le responsable
    const responsableData: Responsable[] = selectedResponsable.titulaireId && selectedResponsable.anneeId
      ? [{
          titulaireId: selectedResponsable.titulaireId,
          anneeId: selectedResponsable.anneeId
        }]
      : [];

    const finalFormData = {
      ...formData,
      responsable: responsableData
    };

    try {
      if (unite?._id) {
        await updateUnite(unite._id, finalFormData);
      } else {
        await createUnite(finalFormData);
      }
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a._id === agentId);
    if (!agent) return 'Agent inconnu';
    const name = `${agent.prenom || ''} ${agent.nom || ''}`.trim();
    return name || 'Agent inconnu';
  };

  // AJOUT: Fonction pour obtenir le nom de l'année
  const getAnneeName = (anneeId: string) => {
    const annee = annees.find(a => a._id === anneeId);
    if (!annee) return 'Année inconnue';
    return `${annee.debut || ''} - ${annee.fin || ''}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {unite ? "Modifier l'unité d'enseignement" : "Créer une nouvelle unité d'enseignement"}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Remplissez les informations de l'unité d'enseignement et désignez un responsable.
              </p>
            </div>

            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.descripteur.code}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    descripteur: { ...prev.descripteur, code: e.target.value }
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: INF101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mention *
                </label>
                <input
                  type="text"
                  required
                  value={formData.descripteur.mention}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    descripteur: { ...prev.descripteur, mention: e.target.value }
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Informatique"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Désignation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.descripteur.designation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    descripteur: { ...prev.descripteur, designation: e.target.value }
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Introduction à la programmation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Crédits *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.descripteur.credit}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    descripteur: { ...prev.descripteur, credit: parseInt(e.target.value) || 0 }
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type *
                </label>
                <select
                  value={formData.descripteur.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    descripteur: { ...prev.descripteur, type: e.target.value as "Obigatoire" | "Optionnelle" }
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Obigatoire">Obligatoire</option>
                  <option value="Optionnelle">Optionnel</option>
                </select>
              </div>
            </div>

            {/* SECTION RESPONSABLE AMÉLIORÉE */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                👤 Désignation du responsable
              </h4>
              
              {/* État de chargement */}
              {(loadingAgents || anneesLoading) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      Chargement des {loadingAgents ? 'agents' : 'années'}...
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sélection de l'agent responsable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Agent responsable
                  </label>
                  <select
                    value={selectedResponsable.titulaireId}
                    onChange={(e) => setSelectedResponsable(prev => ({
                      ...prev,
                      titulaireId: e.target.value
                    }))}
                    disabled={loadingAgents}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Sélectionner un agent</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {`${agent.prenom || ''} ${agent.nom || ''}${agent.grade ? ` - ${agent.grade}` : ''}`.trim()}
                      </option>
                    ))}
                  </select>
                  {loadingAgents && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Chargement des agents...
                    </p>
                  )}
                </div>

                {/* NOUVEAU: Sélection de l'année */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Année de responsabilité *
                  </label>
                  <select
                    value={selectedResponsable.anneeId}
                    onChange={(e) => setSelectedResponsable(prev => ({
                      ...prev,
                      anneeId: e.target.value
                    }))}
                    disabled={anneesLoading}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    required={!!selectedResponsable.titulaireId}
                  >
                    <option value="">Sélectionner une année</option>
                    {annees.map((annee) => (
                      <option key={annee._id} value={annee._id}>
                        {annee.debut} - {annee.fin}
                      </option>
                    ))}
                  </select>
                  {anneesLoading && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Chargement des années...
                    </p>
                  )}
                  {annees.length === 0 && !anneesLoading && (
                    <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                      Aucune année disponible
                    </p>
                  )}
                </div>
              </div>

              {/* NOUVEAU: Aperçu du responsable sélectionné */}
              {selectedResponsable.titulaireId && selectedResponsable.anneeId && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 dark:text-green-400">✅</span>
                    <div className="text-sm">
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Responsable désigné:
                      </span>
                      <span className="text-green-700 dark:text-green-300 ml-1">
                        {getAgentName(selectedResponsable.titulaireId)}
                      </span>
                      <span className="text-green-600 dark:text-green-400 ml-2">
                        pour l'année {getAnneeName(selectedResponsable.anneeId)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Avertissement si seulement un champ est rempli */}
              {(selectedResponsable.titulaireId && !selectedResponsable.anneeId) || 
               (!selectedResponsable.titulaireId && selectedResponsable.anneeId) && (
                <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      Veuillez sélectionner à la fois un agent et une année pour désigner un responsable.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || loadingAgents || anneesLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{unite ? "Modification..." : "Création..."}</span>
                  </div>
                ) : (
                  unite ? "Modifier l'unité" : "Créer l'unité"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}