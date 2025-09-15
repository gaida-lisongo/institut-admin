"use client";
import React, { useState, useEffect } from "react";
import { Cours } from "@/services/CoursService";
import { useCoursStore } from "@/stores/coursStore";
import { useUniteStore } from "@/stores/uniteStore";

interface CoursManagementProps {
  uniteId: string;
  sectionId: string;
}

export default function CoursManagement({ uniteId, sectionId }: CoursManagementProps) {
  // CORRECTION: Appeler les hooks directement dans le corps du composant
  const { cours, fetchCours, createCours, updateCours, deleteCours, loading: coursLoading } = useCoursStore();
  const { unites, updateUnite, fetchUnites, loading: uniteLoading } = useUniteStore();

  // States locaux
  const [availableCours, setAvailableCours] = useState<Cours[]>([]);
  const [assignedCours, setAssignedCours] = useState<Cours[]>([]);
  const [isAddingCours, setIsAddingCours] = useState(false);
  const [currentUnite, setCurrentUnite] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newCoursData, setNewCoursData] = useState({
    titre: "",
    description: "",
    credit: 1
  });

  const loading = coursLoading || uniteLoading || actionLoading;

  console.log("CoursManagement rendu avec:", { uniteId, sectionId });

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Chargement des données...");
        await Promise.all([fetchCours(), fetchUnites()]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    loadData();
  }, [fetchCours, fetchUnites]);

  // Mise à jour des listes quand les données changent
  useEffect(() => {
    console.log("Mise à jour des listes - cours:", cours.length, "unites:", unites.length);
    
    // Trouver l'unité courante
    const unite = unites.find((u: any) => u._id === uniteId);
    console.log("Unité trouvée:", unite ? unite.descripteur.designation : "Non trouvée");
    setCurrentUnite(unite);
    
    // Séparer les cours disponibles et assignés
    const assigned = cours.filter((c: Cours) => c.enseignement && c.enseignement.includes(uniteId));
    const available = cours.filter((c: Cours) => !c.enseignement || !c.enseignement.includes(uniteId));
    
    console.log("Cours assignés:", assigned.length, "Cours disponibles:", available.length);
    
    setAssignedCours(assigned);
    setAvailableCours(available);
  }, [cours, unites, uniteId]);

  // Gestion des actions
  const handleCreateCours = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      console.log("Création d'un nouveau cours pour l'unité:", uniteId);
      
      const newCours: Partial<Cours> = {
        titre: newCoursData.titre,
        description: newCoursData.description,
        credit: newCoursData.credit,
        enseignement: [uniteId], // Assigner directement à cette unité
        contenu: [],
        repartition: [],
        plan: [],
        seances: [],
        travaux: []
      };
      
      // Créer le cours
      await createCours(newCours as Cours);
      
      // Recharger les données
      await fetchCours();
      
      // Reset form
      setNewCoursData({ titre: "", description: "", credit: 1 });
      setIsAddingCours(false);
      
      console.log("Cours créé avec succès");
      alert("Cours créé avec succès !");
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
      console.log("Assignation du cours:", coursId, "à l'unité:", uniteId);
      
      const coursToAssign = availableCours.find(c => c._id === coursId);
      if (coursToAssign && currentUnite) {
        // Mettre à jour le cours
        const updatedEnseignement = [...(coursToAssign.enseignement || []), uniteId];
        await updateCours(coursId, { ...coursToAssign, enseignement: updatedEnseignement });
        
        // Mettre à jour l'unité
        const updatedCours = [...(currentUnite.cours || []), coursId];
        await updateUnite(uniteId, { ...currentUnite, cours: updatedCours });
        
        // Recharger les données
        await Promise.all([fetchCours(), fetchUnites()]);
        
        console.log("Assignation réussie");
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
      console.log("Désassignation du cours:", coursId, "de l'unité:", uniteId);
      
      const coursToUnassign = assignedCours.find(c => c._id === coursId);
      if (coursToUnassign && currentUnite) {
        // Mettre à jour le cours
        const updatedEnseignement = (coursToUnassign.enseignement || []).filter(id => id !== uniteId);
        await updateCours(coursId, { ...coursToUnassign, enseignement: updatedEnseignement });
        
        // Mettre à jour l'unité
        const updatedCours = (currentUnite.cours || []).filter((id: string) => id !== coursId);
        await updateUnite(uniteId, { ...currentUnite, cours: updatedCours });
        
        // Recharger les données
        await Promise.all([fetchCours(), fetchUnites()]);
        
        console.log("Désassignation réussie");
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
      console.log("Suppression du cours:", coursId);
      
      // Si le cours est assigné à cette unité, le désassigner d'abord
      if (currentUnite && currentUnite.cours && currentUnite.cours.includes(coursId)) {
        const updatedCours = currentUnite.cours.filter((id: string) => id !== coursId);
        await updateUnite(uniteId, { ...currentUnite, cours: updatedCours });
      }
      
      // Supprimer le cours
      await deleteCours(coursId);
      
      // Recharger les données
      await Promise.all([fetchCours(), fetchUnites()]);
      
      console.log("Cours supprimé avec succès");
      alert("Cours supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  // Fonctions utilitaires
  const getTotalCredits = () => {
    return assignedCours.reduce((total, cours) => total + cours.credit, 0);
  };

  const getResponsableInfo = () => {
    if (!currentUnite || !currentUnite.responsable || currentUnite.responsable.length === 0) {
      return "Aucun responsable désigné";
    }
    
    const responsable = currentUnite.responsable[0];
    return `Titulaire: ${responsable.titulaireId}`;
  };

  // Vérification des props
  if (!uniteId || !sectionId) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <div className="text-red-800 dark:text-red-200">
          Erreur: Paramètres manquants (uniteId: {uniteId}, sectionId: {sectionId})
        </div>
      </div>
    );
  }

  // État de chargement initial
  if (loading && cours.length === 0 && unites.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des cours et unités...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug info en développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Debug:</strong> uniteId={uniteId}, currentUnite={currentUnite?.descripteur?.designation || 'Non trouvée'}, 
            cours total={cours.length}, assignés={assignedCours.length}, disponibles={availableCours.length}
            {loading && " - Chargement..."}
          </div>
        </div>
      )}

      {/* Informations sur l'unité et responsable */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Gestion des cours
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {currentUnite ? currentUnite.descripteur.designation : "Chargement de l'unité..."}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Responsable
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              {getResponsableInfo()}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {assignedCours.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Cours assignés
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {getTotalCredits()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total crédits
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {availableCours.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Cours disponibles
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setIsAddingCours(true)}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          ➕ Créer un nouveau cours
        </button>
      </div>

      {/* Formulaire de création de cours */}
      {isAddingCours && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Créer un nouveau cours
          </h3>
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Après création, le cours sera automatiquement assigné à cette unité. 
              Les détails (objectifs, ressources, etc.) seront à préciser par le responsable de l'unité.
            </p>
          </div>
          
          <form onSubmit={handleCreateCours} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Description basique du cours (les détails seront précisés par le responsable)..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingCours(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer le cours"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cours assignés à cette unité */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📚 Cours assignés à cette unité ({assignedCours.length})
        </h3>
        
        {assignedCours.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              Aucun cours assigné à cette unité
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Créez un nouveau cours ou assignez un cours existant depuis la liste des cours disponibles.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Crédits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {assignedCours.map((cours) => (
                  <tr key={cours._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {cours.titre}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {cours.description || "Description à préciser par le responsable"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {cours.credit} crédit{cours.credit > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleUnassignCours(cours._id!)}
                        disabled={loading}
                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-50"
                        title="Désassigner de cette unité"
                      >
                        ↩️ Désassigner
                      </button>
                      <button
                        onClick={() => handleDeleteCours(cours._id!)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                        title="Supprimer définitivement"
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cours disponibles */}
      {availableCours.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📋 Cours disponibles pour assignation ({availableCours.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Crédits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {availableCours.map((cours) => (
                  <tr key={cours._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {cours.titre}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {cours.description || "Description à préciser"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {cours.credit} crédit{cours.credit > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleAssignCours(cours._id!)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50"
                        title="Assigner à cette unité"
                      >
                        ➡️ Assigner à cette unité
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}