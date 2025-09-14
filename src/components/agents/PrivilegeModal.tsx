"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Agent, Privilge } from "@/types/agent";
import { AgentService } from "@/services/AgentService";
import { useSectionStore } from "@/stores/sectionStore";

interface PrivilegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

const ROLES = [
  { value: 'chef', label: 'Chef', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  { value: 'enseignement', label: 'Enseignement', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  { value: 'recherche', label: 'Recherche', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  { value: 'academique', label: 'Académique', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
  { value: 'administratif', label: 'Administratif', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'appariteur', label: 'Appariteur', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300' },
];

export default function PrivilegeModal({ isOpen, onClose, agent }: PrivilegeModalProps) {
  const [privileges, setPrivileges] = useState<Privilge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrivilege, setNewPrivilege] = useState({
    role: '',
    sectionId: ''
  });
  
  const { sections, fetchSections } = useSectionStore();

  const agentService = new AgentService();

  useEffect(() => {
    if(!sections || sections.length === 0) {
        fetchSections();
    }
  }, [sections, fetchSections]);

  useEffect(() => {
    if (isOpen && agent?._id) {
      fetchPrivileges();
    }
  }, [isOpen, agent]);

  const fetchPrivileges = async () => {
    if (!agent?._id) return;
    
    try {
      setLoading(true);
      const agentPrivileges = await AgentService.getPrivilegesByAgent(agent._id);
      setPrivileges(agentPrivileges || []);
    } catch (error) {
      console.error("Erreur lors du chargement des privilèges:", error);
      setError("Erreur lors du chargement des privilèges");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrivilege = async () => {
    if (!agent?._id || !newPrivilege.role || !newPrivilege.sectionId) return;

    // Vérifier si ce privilège exact existe déjà (même rôle + même section)
    const existingPrivilege = privileges.find(p => 
      p.role === newPrivilege.role && p.sectionId === newPrivilege.sectionId
    );

    if (existingPrivilege) {
      setError(`Ce privilège existe déjà : ${newPrivilege.role} sur ${getSectionName(newPrivilege.sectionId)}`);
      return;
    }

    try {
      setLoading(true);
      setError(""); // Clear previous errors
      const privilegeData: Privilge = {
        role: newPrivilege.role,
        sectionId: newPrivilege.sectionId,
        userId: agent._id
      };

      await agentService.createPrivilege(privilegeData);
      await fetchPrivileges(); // Recharger la liste
      setNewPrivilege({ role: '', sectionId: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du privilège:", error);
      setError("Erreur lors de l'ajout du privilège");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrivilege = async (privilegeId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce privilège ?")) return;

    try {
      setLoading(true);
      await agentService.deletePrivilege(privilegeId);
      await fetchPrivileges(); // Recharger la liste
      setError(""); // Clear any errors
    } catch (error) {
      console.error("Erreur lors de la suppression du privilège:", error);
      setError("Erreur lors de la suppression du privilège");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrivilege = async (privilegeId: string, newRole: string) => {
    try {
      setLoading(true);
      await agentService.updatePrivilege(privilegeId, { role: newRole });
      await fetchPrivileges(); // Recharger la liste
      setError(""); // Clear any errors
    } catch (error) {
      console.error("Erreur lors de la mise à jour du privilège:", error);
      setError("Erreur lors de la mise à jour du privilège");
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role: string) => {
    return ROLES.find(r => r.value === role) || ROLES[0];
  };

  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s._id === sectionId);
    return section?.description?.designation || 'Section inconnue';
  };

  // Grouper les privilèges par section pour un meilleur affichage
  const groupedPrivileges = privileges.reduce((acc, privilege) => {
    const sectionId = privilege.sectionId;
    if (!acc[sectionId]) {
      acc[sectionId] = [];
    }
    acc[sectionId].push(privilege);
    return acc;
  }, {} as Record<string, Privilge[]>);

  if (!agent) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl" >
      <div className="space-y-6 p-6">
        {/* En-tête avec informations de l'agent */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <div className="flex items-center space-x-4">
            {agent.photo ? (
              <img
                src={agent.photo}
                alt={`${agent.nom} ${agent.prenom}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {agent.nom.charAt(0)}{agent.prenom.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {agent.titre} {agent.nom} {agent.post_nom}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">{agent.prenom}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                  {agent.matricule}
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                  {agent.grade}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Section des privilèges */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Privilèges assignés ({privileges.length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={loading || sections.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Ajouter un privilège</span>
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Nouveau privilège
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rôle
                  </label>
                  <select
                    value={newPrivilege.role}
                    onChange={(e) => setNewPrivilege(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Sélectionner un rôle</option>
                    {ROLES.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section
                  </label>
                  <select
                    value={newPrivilege.sectionId}
                    onChange={(e) => setNewPrivilege(prev => ({ ...prev, sectionId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Sélectionner une section</option>
                    {sections.map(section => (
                      <option key={section._id} value={section._id}>
                        {section.description?.designation || 'Section sans nom'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-4">
                <button
                  onClick={handleAddPrivilege}
                  disabled={loading || !newPrivilege.role || !newPrivilege.sectionId}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Ajout..." : "Ajouter"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewPrivilege({ role: '', sectionId: '' });
                    setError(""); // Clear error when canceling
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des privilèges */}
          {loading && privileges.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
            </div>
          ) : privileges.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🔐</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun privilège assigné
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Cet agent n'a encore aucun privilège. Utilisez le bouton ci-dessus pour en ajouter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Affichage groupé par section */}
              {Object.entries(groupedPrivileges).map(([sectionId, sectionPrivileges]) => (
                <div key={sectionId} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      📁 {getSectionName(sectionId)}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {sectionPrivileges.length} privilège(s)
                    </p>
                  </div>
                  <div className="p-2 space-y-2">
                    {sectionPrivileges.map((privilege) => {
                      const roleInfo = getRoleInfo(privilege.role);
                      return (
                        <div
                          key={privilege._id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-600 rounded-md hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                              {roleInfo.label}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Accès {roleInfo.label.toLowerCase()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select
                              value={privilege.role}
                              onChange={(e) => privilege._id && handleUpdatePrivilege(privilege._id, e.target.value)}
                              disabled={loading}
                              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              {ROLES.map(role => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => privilege._id && handleDeletePrivilege(privilege._id)}
                              disabled={loading}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                              title="Supprimer ce privilège"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setError(""); // Clear errors when closing
              onClose();
            }}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}