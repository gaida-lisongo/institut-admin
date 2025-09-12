"use client";
import React, { useEffect, useState } from "react";
import DataTable, { Column } from "@/components/common/DataTable";
import AgentModal from "@/components/agents/AgentModal";
import CSVImportModal from "@/components/agents/CSVImportModal";
import PasswordModal from "@/components/agents/PasswordModal";
import PasswordSecurityInfo from "@/components/agents/PasswordSecurityInfo";
import { useAgentStore } from "@/stores/agentStore";
import { useModal } from "@/hooks/useModal";
import { Agent, AgentFormData } from "@/types/agent";
import { PasswordUtils } from "@/utils/passwordUtils";

export default function AgentsPage() {
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const { isOpen: isCSVModalOpen, openModal: openCSVModal, closeModal: closeCSVModal } = useModal();
  const { isOpen: isPasswordModalOpen, openModal: openPasswordModal, closeModal: closePasswordModal } = useModal();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [passwordAgent, setPasswordAgent] = useState<Agent | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const {
    agents,
    isLoading,
    error,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    createAgentsFromCSV,
    clearError,
  } = useAgentStore();

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Configuration des colonnes pour la DataTable
  const columns: Column<Agent>[] = [
    {
      key: 'photo',
      header: 'Photo',
      render: (agent) => (
        <div className="flex items-center">
          {agent.photo ? (
            <img
              src={agent.photo}
              alt={`${agent.nom} ${agent.prenom}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {agent.nom.charAt(0)}{agent.prenom.charAt(0)}
              </span>
            </div>
          )}
        </div>
      ),
      sortable: false,
    },
    {
      key: 'nom',
      header: 'Nom complet',
      render: (agent) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {agent.titre} {agent.nom} {agent.post_nom}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {agent.prenom}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'matricule',
      header: 'Matricule',
      render: (agent) => (
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {agent.matricule}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'sexe',
      header: 'Sexe',
      render: (agent) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          agent.sexe === 'M' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
        }`}>
          {agent.sexe === 'M' ? 'Masculin' : 'Féminin'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (agent) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {agent.grade || 'Non défini'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'solde',
      header: 'Solde',
      render: (agent) => (
        <span className="font-medium text-green-600 dark:text-green-400">
          {agent.solde.toLocaleString('fr-CD', {
            style: 'currency',
            currency: 'CDF'
          })}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'date_naissance',
      header: 'Âge',
      render: (agent) => {
        if (!agent.date_naissance) return <span className="text-gray-400">-</span>;
        
        const birthDate = new Date(agent.date_naissance);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;
        
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {finalAge} ans
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'nationalite',
      header: 'Nationalité',
      render: (agent) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {agent.nationalite || 'Non définie'}
        </span>
      ),
      sortable: true,
    },
    {
      key: '_id' as keyof Agent,
      header: 'Actions',
      render: (agent) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(agent);
            }}
            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Modifier"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetPassword(agent);
            }}
            className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
            title="Changer le mot de passe"
          >
            🔑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateMatricule(agent);
            }}
            className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
            title="Modifier le matricule"
          >
            🏷️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(agent);
            }}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      ),
      sortable: false,
    },
  ];

  // Actions pour chaque ligne
  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setModalMode('edit');
    openModal();
  };

  const handleDelete = async (agent: Agent) => {
    if (!agent._id) return;
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'agent ${agent.nom} ${agent.prenom} ?`
    );
    
    if (confirmed) {
      try {
        await deleteAgent(agent._id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleResetPassword = (agent: Agent) => {
    setPasswordAgent(agent);
    openPasswordModal();
  };

  const handlePasswordConfirm = async (newPassword: string) => {
    if (!passwordAgent?._id) return;
    
    try {
      console.log("Nouveau mot de passe à définir:", newPassword);
      console.log("Nouveau mot de passe à définir:", PasswordUtils.hashPassword(newPassword));
      await updateAgent(passwordAgent._id, { secure: PasswordUtils.hashPassword(newPassword) });
      alert(`Mot de passe mis à jour avec succès pour ${passwordAgent.nom} ${passwordAgent.prenom}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error; // Le modal gèrera l'affichage de l'erreur
    }
  };

  const handleUpdateMatricule = async (agent: Agent) => {
    if (!agent._id) return;
    
    const newMatricule = prompt('Nouveau matricule:', agent.matricule);
    if (newMatricule && newMatricule.trim() && newMatricule !== agent.matricule) {
      try {
        await updateAgent(agent._id, { matricule: newMatricule.trim() });
        alert('Matricule mis à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du matricule:', error);
        alert('Erreur lors de la mise à jour du matricule');
      }
    }
  };



  // Gestion des formulaires
  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setModalMode('create');
    openModal();
  };

  const handleSubmitAgent = async (agentData: AgentFormData) => {
    try {
      if (modalMode === 'edit' && selectedAgent?._id) {
        await updateAgent(selectedAgent._id, agentData);
      } else {
        await createAgent(agentData);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      throw error;
    }
  };

  const handleCSVImport = async (agentsData: AgentFormData[]) => {
    try {
      await createAgentsFromCSV(agentsData);
      alert(`${agentsData.length} agents importés avec succès !`);
    } catch (error) {
      console.error('Erreur lors de l\'import CSV:', error);
      throw error;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des Agents
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez les agents de l'institut : création, modification, import CSV
        </p>
      </div>

      {/* Information de sécurité */}
      <PasswordSecurityInfo />

      {/* Messages d'erreur */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button
            onClick={clearError}
            className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Actions principales */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={handleCreateAgent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>👤</span>
          <span>Nouvel Agent</span>
        </button>
        
        <button
          onClick={openCSVModal}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <span>📁</span>
          <span>Import CSV</span>
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {agents.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Agents</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {agents.filter(a => a.sexe === 'M').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Hommes</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
            {agents.filter(a => a.sexe === 'F').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Femmes</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {agents.reduce((sum, a) => sum + a.solde, 0).toLocaleString('fr-CD', {
              style: 'currency',
              currency: 'CDF'
            })}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Masse Salariale</div>
        </div>
      </div>

      {/* Table des agents */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
        </div>
      ) : (
        <DataTable
          data={agents}
          columns={columns}
          searchPlaceholder="Rechercher par nom, prénom, matricule..."
          onAdd={handleCreateAgent}
          addButtonText="Nouvel Agent"
        />
      )}

      {/* Modal pour créer/modifier un agent */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitAgent}
        agent={selectedAgent}
        title={modalMode === 'edit' ? 'Modifier l\'agent' : 'Nouvel agent'}
      />

      {/* Modal pour l'import CSV */}
      <CSVImportModal
        isOpen={isCSVModalOpen}
        onClose={closeCSVModal}
        onImport={handleCSVImport}
      />

      {/* Modal pour la gestion des mots de passe */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
        onConfirm={handlePasswordConfirm}
        agentName={passwordAgent ? `${passwordAgent.nom} ${passwordAgent.prenom}` : ''}
      />
    </div>
  );
}