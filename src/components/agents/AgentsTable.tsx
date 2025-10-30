'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useAgentStore } from "@/stores/agentStore";
import { useEffect, useState } from "react";
import { Agent } from "@/types/userTypes";
import { Search, Plus, Edit, Trash2, User } from "lucide-react";
import AgentCreateModal from "./AgentCreateModal";
import AgentEditModal from "./AgentEditModal";

export default function AgentsTable() {
  const { agents, fetchAgents, agentsLoading, agentsError, deleteAgent } = useAgentStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Filtrer les agents selon le terme de recherche
  const filteredAgents = agents.filter((agent) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      agent.matricule.toLowerCase().includes(searchLower) ||
      agent.identites.nom.toLowerCase().includes(searchLower) ||
      agent.identites.postNom.toLowerCase().includes(searchLower) ||
      agent.identites.preNom.toLowerCase().includes(searchLower) ||
      agent.identites.email?.toLowerCase().includes(searchLower) ||
      agent.identites.telephone?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (agent: Agent) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'agent ${agent.identites.nom} ${agent.identites.postNom} ?`)) {
      try {
        await deleteAgent(agent?._id || '');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "success" : "error";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Actif" : "Inactif";
  };

  if (agentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des agents...</span>
      </div>
    );
  }

  if (agentsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-red-800">
            <strong>Erreur:</strong> {agentsError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        {/* Header avec recherche et bouton d'ajout */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gestion des Agents ({filteredAgents.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            {/* Bouton d'ajout */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Nouvel Agent
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Agent
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Matricule
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Contact
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Rôle
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Statut
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm ? "Aucun agent trouvé pour cette recherche" : "Aucun agent enregistré"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <TableRow key={agent.matricule} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                            {agent.identites.nom.charAt(0)}{agent.identites.postNom.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm dark:text-white/90">
                            {agent.identites.nom} {agent.identites.postNom}
                          </p>
                          <span className="text-gray-500 text-xs dark:text-gray-400">
                            {agent.identites.preNom}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                      {agent.matricule}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                      <div>
                        <div>{agent.identites.email || 'N/A'}</div>
                        <div className="text-xs">{agent.identites.telephone || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                      {agent.autorisations.length > 0 ? agent.autorisations[0].role : 'N/A'}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        size="sm"
                        color={getStatusColor(agent.autorisations.length > 0 ? agent.autorisations[0].isActive : false)}
                      >
                        {getStatusText(agent.autorisations.length > 0 ? agent.autorisations[0].isActive : false)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(agent)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(agent)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modales */}
      <AgentCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      <AgentEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAgent(null);
        }}
        agent={selectedAgent}
      />
    </>
  );
}
