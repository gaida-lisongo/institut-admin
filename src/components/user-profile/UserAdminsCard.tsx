"use client";
import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import useAuthStore from "@/stores/authStore";
import useAdminStore from "@/stores/adminStore";
import { useAgentStore } from "@/stores/agentStore";
import { AdminService } from "@/services/AdminService";
import { AdminWithAgent, CreateAdminRequest, UpdateAdminRequest } from "@/types/admin";
import { Agent } from "@/types/agent";

export default function UserAdminsCard() {
  // Modals
  const { isOpen: isCreateOpen, openModal: openCreateModal, closeModal: closeCreateModal } = useModal();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  
  // Stores
  const { user } = useAuthStore();
  const { agents, fetchAgents } = useAgentStore();
  const {
    admins,
    metrics,
    loading,
    error,
    searchTerm,
    selectedRole,
    quotiteRange,
    isCurrentUserAdmin,
    setAdmins,
    setLoading,
    setError,
    setSearchTerm,
    setSelectedRole,
    setQuotiteRange,
    setIsCurrentUserAdmin,
    getFilteredAdmins,
    getUniqueRoles,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    clearError
  } = useAdminStore();

  // Local state
  const [selectedAdmin, setSelectedAdmin] = useState<AdminWithAgent | null>(null);

  // Refs pour les formulaires
  const userIdRef = React.useRef<HTMLSelectElement>(null);
  const roleRef = React.useRef<HTMLInputElement>(null);
  const quotiteRef = React.useRef<HTMLInputElement>(null);

  // Chargement initial des données
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // TODO: Commenter la vérification admin pour l'instant
      // const adminCheck = await AdminService.checkMe();
      // setIsCurrentUserAdmin(adminCheck.isAdmin);
      
      // Pour l'instant, on considère que l'utilisateur est admin
      setIsCurrentUserAdmin(true);

      // Charger la liste des admins
      const adminsData = await AdminService.getAdmins();
      setAdmins(adminsData);

      // Charger la liste des agents depuis le store
      await fetchAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des filtres
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleQuotiteRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const isMin = e.target.name === 'quotiteMin';
    const [min, max] = quotiteRange;
    setQuotiteRange(isMin ? [value, max] : [min, value]);
  };

  // Fonction pour vérifier si l'utilisateur actuel est super-admin
  const isSuperAdmin = () => {
    if (!user) return false;
    // Vérifier si l'utilisateur actuel a le rôle super-admin dans la liste des admins
    const currentUserAdmin = admins.find(admin => admin.userId._id === user._id);
    return currentUserAdmin?.role === 'super-admin';
  };

  // Gestion des formulaires
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdRef.current || !roleRef.current || !quotiteRef.current) return;

    try {
      setLoading(true);
      const newAdminData: CreateAdminRequest = {
        userId: userIdRef.current.value,
        role: roleRef.current.value || 'admin',
        quotite: parseInt(quotiteRef.current.value) || 0
      };

      await AdminService.createAdmin(newAdminData);
      
      // Recharger les données pour avoir les informations complètes avec l'agent populé
      const updatedAdmins = await AdminService.getAdmins();
      setAdmins(updatedAdmins);
      
      closeCreateModal();
      resetCreateForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin || !roleRef.current || !quotiteRef.current) return;

    try {
      setLoading(true);
      const updateData: UpdateAdminRequest = {
        role: roleRef.current.value,
        quotite: parseInt(quotiteRef.current.value)
      };

      await AdminService.updateAdmin(selectedAdmin._id!, updateData);
      
      // Mettre à jour localement
      updateAdmin(selectedAdmin._id!, { ...selectedAdmin, ...updateData });
      
      closeEditModal();
      setSelectedAdmin(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) return;

    try {
      setLoading(true);
      await AdminService.deleteAdmin(adminId);
      deleteAdmin(adminId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    if (userIdRef.current) userIdRef.current.value = '';
    if (roleRef.current) roleRef.current.value = 'admin';
    if (quotiteRef.current) quotiteRef.current.value = '0';
  };

  const openEditModalWithAdmin = (admin: AdminWithAgent) => {
    setSelectedAdmin(admin);
    openEditModal();
    // Pré-remplir le formulaire après ouverture
    setTimeout(() => {
      if (roleRef.current) roleRef.current.value = admin.role;
      if (quotiteRef.current) quotiteRef.current.value = admin.quotite.toString();
    }, 100);
  };

  // Données filtrées
  const filteredAdmins = getFilteredAdmins();
  const uniqueRoles = getUniqueRoles();

  console.log("Is admin: ", { isCurrentUserAdmin });
  // Si l'utilisateur n'est pas admin, afficher un message
  if (!isCurrentUserAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-9a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Accès Administrateur Requis
          </h3>
          <p className="text-gray-500">
            Vous devez avoir les privilèges d'administrateur pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      {/* Header avec Titre et Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Gestion des Administrateurs
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez les privilèges administrateur de la plateforme
          </p>
        </div>
        {isSuperAdmin() && (
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
            + Ajouter Administrateur
          </Button>
        )}
        {!isSuperAdmin() && (
          <div className="text-sm text-gray-500 italic">
            Seuls les super-admins peuvent ajouter des administrateurs
          </div>
        )}
      </div>

      {/* Métriques */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.total}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Admins
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.totalQuotite}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Quotité Totale
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.averageQuotite}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Quotité Moyenne
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.keys(metrics.roleDistribution).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Rôles Différents
            </div>
          </div>
        </div>
      )}

      {/* Filtres et Recherche */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, matricule..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={selectedRole}
            onChange={handleRoleFilter}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les rôles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Quotité:</label>
            <input
              type="number"
              name="quotiteMin"
              value={quotiteRange[0]}
              onChange={handleQuotiteRangeChange}
              min="0"
              max="100"
              className="w-16 px-2 py-1 border border-gray-300 rounded"
            />
            <span>-</span>
            <input
              type="number"
              name="quotiteMax"
              value={quotiteRange[1]}
              onChange={handleQuotiteRangeChange}
              min="0"
              max="100"
              className="w-16 px-2 py-1 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="text-red-800">
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Table des Administrateurs */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matricule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quotité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'ajout
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aucun administrateur trouvé
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {admin.userId.prenom} {admin.userId.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {admin.userId.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.userId.matricule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.quotite}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModalWithAdmin(admin)}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin._id!)}
                        className="text-red-600 hover:text-red-900 px-2 py-1 rounded"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Création */}
      <Modal isOpen={isCreateOpen} onClose={closeCreateModal}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ajouter un Administrateur
          </h3>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <Label htmlFor="userId">Agent</Label>
              <select
                ref={userIdRef}
                id="userId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un agent</option>
                {agents.map(agent => (
                  <option key={agent._id} value={agent._id}>
                    {agent.prenom} {agent.nom} ({agent.matricule})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <input
                ref={roleRef}
                type="text"
                id="role"
                defaultValue="admin"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="quotite">Quotité (%)</Label>
              <input
                ref={quotiteRef}
                type="number"
                id="quotite"
                min="0"
                max="100"
                defaultValue="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={closeCreateModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Modification */}
      <Modal isOpen={isEditOpen} onClose={closeEditModal}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Modifier l'Administrateur
          </h3>
          {selectedAdmin && (
            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div>
                <Label>Agent</Label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                  {selectedAdmin.userId.prenom} {selectedAdmin.userId.nom} ({selectedAdmin.userId.matricule})
                </div>
              </div>
              <div>
                <Label htmlFor="editRole">Rôle</Label>
                <input
                  ref={roleRef}
                  type="text"
                  id="editRole"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="editQuotite">Quotité (%)</Label>
                <input
                  ref={quotiteRef}
                  type="number"
                  id="editQuotite"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
