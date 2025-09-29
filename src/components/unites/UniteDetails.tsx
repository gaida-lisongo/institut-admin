"use client";
import React, { useState, useEffect } from "react";
import { Unite } from "@/services/UniteService";
import { Cours } from "@/services/CoursService";
import { useCoursStore } from "@/stores/coursStore";
import { useUniteStore } from "@/stores/uniteStore";
import UniteModal from "./UniteModal";
import { useAgentStore } from "@/stores/agentStore";

interface UniteDetailsProps {
  unite: Unite;
  sectionId: string;
}

export default function UniteDetails({ unite, sectionId }: UniteDetailsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddingCours, setIsAddingCours] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Cours>("titre");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // NOUVEAU: État pour la recherche des cours disponibles
  const [availableSearchTerm, setAvailableSearchTerm] = useState("");
  const [showAllAvailable, setShowAllAvailable] = useState(false);

  // État pour l'édition de cours
  const [editingCours, setEditingCours] = useState<Cours | null>(null);
  const [editCoursData, setEditCoursData] = useState({
    titre: "",
    description: "",
    credit: 1
  });

  // Stores
  const { cours, fetchCours, createCours, updateCours, deleteCours, loading: coursLoading } = useCoursStore();
  const { updateUnite, loading: uniteLoading } = useUniteStore();

  // États locaux
  const [assignedCours, setAssignedCours] = useState<Cours[]>([]);
  const [availableCours, setAvailableCours] = useState<Cours[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [newCoursData, setNewCoursData] = useState({
    titre: "",
    description: "",
    credit: 1
  });

  const { agents, fetchAgents } = useAgentStore();

  const loading = coursLoading || uniteLoading || actionLoading;

  // Hooks doivent être appelés avant toute condition de retour
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Chargement initial des données
  useEffect(() => {
    fetchCours();
  }, [fetchCours]);

  // Mise à jour des listes quand les données changent
  useEffect(() => {
    if (unite._id) {
      const assigned = cours.filter((c: Cours) => c.enseignement && c.enseignement.includes(unite._id!));
      const available = cours.filter((c: Cours) => !c.enseignement || !c.enseignement.includes(unite._id!));
      
      setAssignedCours(assigned);
      setAvailableCours(available);
    }
  }, [cours, unite._id]);

  // Vérification de sécurité pour l'ID de l'unité
  if (!unite._id) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400">
          Erreur: ID de l'unité manquant
        </div>
      </div>
    );
  }

  // NOUVEAU: Filtrer les cours disponibles selon la recherche
  const filteredAvailableCours = availableCours.filter(cours => 
    cours.titre.toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
    (cours.description && cours.description.toLowerCase().includes(availableSearchTerm.toLowerCase()))
  );

  // NOUVEAU: Cours disponibles à afficher (avec ou sans limite)
  const displayedAvailableCours = showAllAvailable 
    ? filteredAvailableCours 
    : filteredAvailableCours.slice(0, 6);

  // Filtrer et trier les cours assignés
  const filteredAndSortedCours = assignedCours
    .filter(cours => 
      cours.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cours.description && cours.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Gestionnaires d'événements
  const handleSort = (field: keyof Cours) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Gestionnaire pour ouvrir l'édition d'un cours
  const handleEditCours = (cours: Cours) => {
    setEditingCours(cours);
    setEditCoursData({
      titre: cours.titre,
      description: cours.description || "",
      credit: cours.credit
    });
  };

  // Gestionnaire pour fermer l'édition
  const handleCloseEditCours = () => {
    setEditingCours(null);
    setEditCoursData({
      titre: "",
      description: "",
      credit: 1
    });
  };

  // Gestionnaire pour sauvegarder les modifications
  const handleSaveEditCours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCours || !editingCours._id) return;

    try {
      setActionLoading(true);
      
      const updatedCoursData = {
        ...editingCours,
        titre: editCoursData.titre,
        description: editCoursData.description,
        credit: editCoursData.credit
      };

      await updateCours(editingCours._id, updatedCoursData);
      await fetchCours();
      
      handleCloseEditCours();
      alert("Cours modifié avec succès !");
      
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert("Erreur lors de la modification du cours");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCours = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      
      const newCours: Partial<Cours> = {
        titre: newCoursData.titre,
        description: newCoursData.description,
        credit: newCoursData.credit,
        enseignement: [],
        contenu: [],
        repartition: [],
        plan: [],
        seances: [],
        travaux: []
      };
      
      console.log("Création d'un nouveau cours (non assigné)");
      
      const coursCreated = await createCours(newCours as Cours);
      console.log("Cours créé avec ID:", coursCreated._id);
      
      if (coursCreated._id) {
        await handleAssignCours(coursCreated._id);
        console.log("Cours automatiquement assigné à l'unité");
      }
      
      setNewCoursData({ titre: "", description: "", credit: 1 });
      setIsAddingCours(false);
      
      console.log("Cours créé et assigné avec succès");
      
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Erreur lors de la création du cours");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignCours = async (coursId: string) => {
    try {
      setActionLoading(true);
      
      const coursToAssign = availableCours.find(c => c._id === coursId);
      if (coursToAssign) {
        const updatedEnseignement = [...(coursToAssign.enseignement || []), unite._id!];
        await updateCours(coursId, { ...coursToAssign, enseignement: updatedEnseignement });
        
        // S'assurer que le tableau cours contient uniquement des IDs de type string
        const currentCours = unite.cours || [];
        const currentCoursIds = currentCours.map((c: string | Cours) => 
          typeof c === 'string' ? c : c._id
        );
        
        if (!currentCoursIds.includes(coursId)) {
          const updatedCours = [...currentCoursIds, coursId];
          await updateUnite(unite._id!, { ...unite, cours: updatedCours as string[] });
        }
        
        await fetchCours();
        alert("Cours assigné avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de l'assignation:", error);
      alert("Erreur lors de l'assignation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnassignCours = async (coursId: string) => {
    try {
      setActionLoading(true);
      
      const coursToUnassign = assignedCours.find(c => c._id === coursId);
      if (coursToUnassign) {
        const updatedEnseignement = (coursToUnassign.enseignement || []).filter(id => id !== unite._id);
        await updateCours(coursId, { ...coursToUnassign, enseignement: updatedEnseignement });
        
        const updatedCours = (unite.cours || [])
          .filter((item: string | Cours) => {
            const id = typeof item === 'string' ? item : item._id;
            return id !== coursId;
          })
          .map((item: string | Cours) => typeof item === 'string' ? item : item._id!);
        await updateUnite(unite._id!, { ...unite, cours: updatedCours });
        
        await fetchCours();
        alert("Cours désassigné avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la désassignation:", error);
      alert("Erreur lors de la désassignation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCours = async (coursId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return;

    try {
      setActionLoading(true);
      
      if (unite.cours && unite.cours.some((item: string | Cours) => {
        const id = typeof item === 'string' ? item : item._id;
        return id === coursId;
      })) {
        const updatedCours = unite.cours.filter((item: string | Cours) => {
          const id = typeof item === 'string' ? item : item._id;
          return id !== coursId;
        });
        
        // Convert to string IDs for updateUnite (which expects UniteFormData format)
        const coursIds = updatedCours.map((item: string | Cours) => 
          typeof item === 'string' ? item : item._id!
        );
        
        await updateUnite(unite._id!, { ...unite, cours: coursIds });
      }
      
      await deleteCours(coursId);
      await fetchCours();
      
      alert("Cours supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  // Utilitaires
  const getTotalCredits = () => {
    return assignedCours.reduce((total, cours) => total + cours.credit, 0);
  };

  const getResponsableInfo = () => {
    if (!unite.responsable || unite.responsable.length === 0) {
      return "Aucun responsable désigné";
    }
    const responsable = unite.responsable[0];
    const agent = agents.find(a => a._id === responsable.titulaireId);
    return agent ? `${agent.prenom} ${agent.nom}` : responsable.titulaireId;
  };

  return (
    <div className="space-y-6">
      {/* BANNIÈRE D'INFORMATIONS DE L'UNITÉ */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {unite.descripteur.designation}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Code: {unite.descripteur.code} • Mention: {unite.descripteur.mention}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{assignedCours.length}</div>
                  <div className="text-sm text-blue-100">Cours assignés</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{getTotalCredits()}</div>
                  <div className="text-sm text-blue-100">Total crédits</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{unite.descripteur.credit}</div>
                  <div className="text-sm text-blue-100">Crédits UE</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    unite.descripteur.type === 'Obigatoire' 
                      ? 'bg-red-500/20 text-red-100'
                      : 'bg-green-500/20 text-green-100'
                  }`}>
                    {unite.descripteur.type}
                  </div>
                  <div className="text-sm text-blue-100 mt-1">Type</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>✏️</span>
                <span>Modifier</span>
              </button>
              <div className="text-right text-sm">
                <div className="text-blue-100">Responsable</div>
                <div className="font-medium">{getResponsableInfo()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DATATABLE DES COURS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        {/* En-tête du DataTable */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                📚 Cours associés à cette unité
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Gérez les cours assignés à cette unité d'enseignement
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAddingCours(true)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <span>➕</span>
                <span>Nouveau cours</span>
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <span className="text-gray-400">🔍</span>
                </span>
                <input
                  type="text"
                  placeholder="Rechercher un cours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAndSortedCours.length} cours trouvé{filteredAndSortedCours.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Tableau des cours */}
        {filteredAndSortedCours.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {assignedCours.length === 0 ? "Aucun cours assigné" : "Aucun résultat"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {assignedCours.length === 0 
                ? "Commencez par créer un nouveau cours ou assigner un cours existant."
                : "Aucun cours ne correspond à votre recherche."
              }
            </p>
            {assignedCours.length === 0 && (
              <button
                onClick={() => setIsAddingCours(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                ➕ Créer le premier cours
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort("titre")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Titre du cours</span>
                      <span className="text-gray-400">
                        {sortField === "titre" ? (sortDirection === "asc" ? "↑" : "↓") : "↕️"}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort("credit")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Crédits</span>
                      <span className="text-gray-400">
                        {sortField === "credit" ? (sortDirection === "asc" ? "↑" : "↓") : "↕️"}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedCours.map((cours, index) => (
                  <tr 
                    key={cours._id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-900/20'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            {cours.titre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {cours.titre}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {cours._id?.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                        {cours.description ? (
                          <span className="line-clamp-2">{cours.description}</span>
                        ) : (
                          <span className="text-gray-400 italic">Description à préciser</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {cours.credit} crédit{cours.credit > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Assigné
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditCours(cours)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Modifier le cours"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleUnassignCours(cours._id!)}
                          disabled={loading}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-50 transition-colors p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          title="Désassigner de cette unité"
                        >
                          ↩️
                        </button>
                        <button
                          onClick={() => handleDeleteCours(cours._id!)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Supprimer définitivement"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION COURS DISPONIBLES AMÉLIORÉE AVEC RECHERCHE */}
      {availableCours.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          {/* En-tête avec recherche */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📋 Cours disponibles pour assignation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Recherchez et assignez des cours existants à cette unité
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {availableCours.length} cours disponible{availableCours.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* NOUVELLE: Barre de recherche pour les cours disponibles */}
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <span className="text-gray-400">🔍</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher dans les cours disponibles..."
                    value={availableSearchTerm}
                    onChange={(e) => setAvailableSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredAvailableCours.length} trouvé{filteredAvailableCours.length !== 1 ? 's' : ''}
                </span>
                {filteredAvailableCours.length > 6 && (
                  <button
                    onClick={() => setShowAllAvailable(!showAllAvailable)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    {showAllAvailable ? "Afficher moins" : `Voir tous (${filteredAvailableCours.length})`}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredAvailableCours.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🔍</div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun cours trouvé
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  {availableSearchTerm 
                    ? `Aucun cours disponible ne correspond à "${availableSearchTerm}"`
                    : "Aucun cours disponible pour le moment"
                  }
                </p>
                {availableSearchTerm && (
                  <button
                    onClick={() => setAvailableSearchTerm("")}
                    className="mt-3 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedAvailableCours.map((cours) => (
                    <div key={cours._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {cours.titre}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                            {cours.description || "Description à préciser"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {cours.credit} crédit{cours.credit > 1 ? 's' : ''}
                            </span>
                            <button
                              onClick={() => handleAssignCours(cours._id!)}
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium disabled:opacity-50 transition-colors"
                            >
                              ➡️ Assigner
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* NOUVEAU: Indicateurs et contrôles d'affichage */}
                {filteredAvailableCours.length > 6 && (
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Affichage de {displayedAvailableCours.length} sur {filteredAvailableCours.length} cours
                      {availableSearchTerm && ` pour "${availableSearchTerm}"`}
                    </div>
                    <button
                      onClick={() => setShowAllAvailable(!showAllAvailable)}
                      className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {showAllAvailable 
                        ? "Afficher moins" 
                        : `Afficher tous les ${filteredAvailableCours.length} cours`
                      }
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal d'édition de cours */}
      {editingCours && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseEditCours}></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSaveEditCours}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 dark:text-blue-400 text-lg font-medium">
                        ✏️
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Modifier le cours
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {editingCours._id?.slice(-8)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Titre *
                      </label>
                      <input
                        type="text"
                        required
                        value={editCoursData.titre}
                        onChange={(e) => setEditCoursData(prev => ({ ...prev, titre: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Ex: Introduction aux algorithmes"
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
                        value={editCoursData.credit}
                        onChange={(e) => setEditCoursData(prev => ({ ...prev, credit: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={editCoursData.description}
                        onChange={(e) => setEditCoursData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Description du cours..."
                      />
                    </div>

                    {/* Aperçu des modifications */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        📝 Modifications à appliquer:
                      </h4>
                      <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                        {editCoursData.titre !== editingCours.titre && (
                          <div>• Titre: "{editingCours.titre}" → "{editCoursData.titre}"</div>
                        )}
                        {editCoursData.credit !== editingCours.credit && (
                          <div>• Crédits: {editingCours.credit} → {editCoursData.credit}</div>
                        )}
                        {editCoursData.description !== (editingCours.description || "") && (
                          <div>• Description modifiée</div>
                        )}
                        {editCoursData.titre === editingCours.titre && 
                         editCoursData.credit === editingCours.credit && 
                         editCoursData.description === (editingCours.description || "") && (
                          <div className="text-gray-500 dark:text-gray-400">Aucune modification détectée</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sauvegarde...</span>
                      </div>
                    ) : (
                      "Sauvegarder les modifications"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseEditCours}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de cours */}
      {isAddingCours && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsAddingCours(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateCours}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Créer un nouveau cours pour cette unité
                  </h3>
                  
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>📌 Processus:</strong> Le cours sera créé puis automatiquement assigné à l'unité 
                      <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">
                        {unite.descripteur.code} - {unite.descripteur.designation}
                      </span>
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Titre *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCoursData.titre}
                        onChange={(e) => setNewCoursData(prev => ({ ...prev, titre: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Ex: Introduction aux algorithmes"
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
                        value={newCoursData.credit}
                        onChange={(e) => setNewCoursData(prev => ({ ...prev, credit: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description (optionnelle)
                      </label>
                      <textarea
                        rows={3}
                        value={newCoursData.description}
                        onChange={(e) => setNewCoursData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Description du cours..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Création et assignation...</span>
                      </div>
                    ) : (
                      "Créer et assigner le cours"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCours(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      <UniteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        unite={unite}
        sectionId={sectionId}
      />
    </div>
  );
}
