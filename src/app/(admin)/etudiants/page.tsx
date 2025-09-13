"use client";
import React, { useEffect, useState } from "react";
import DataTable from "@/components/common/DataTable";
import EtudiantModal from "@/components/etudiants/EtudiantModal";
import CSVImportModal from "@/components/etudiants/CSVImportModal";
import { useEtudiantStore } from "@/stores/etudiantStore";
import { Etudiant, EtudiantFormData } from "@/types/etudiant";
import { PlusIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";

export default function EtudiantsPage() {
  const {
    etudiants,
    loading,
    fetchEtudiants,
    createEtudiant,
    updateEtudiant,
    deleteEtudiant,
    importEtudiants,
    exportEtudiants,
  } = useEtudiantStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);

  useEffect(() => {
    fetchEtudiants();
  }, [fetchEtudiants]);

  const handleCreate = async (data: EtudiantFormData) => {
    await createEtudiant(data);
    setIsCreateModalOpen(false);
  };

  const handleEdit = async (data: EtudiantFormData) => {
    if (selectedEtudiant) {
      await updateEtudiant(selectedEtudiant._id, data);
      setIsEditModalOpen(false);
      setSelectedEtudiant(null);
    }
  };

  const handleDelete = async (etudiantId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
      await deleteEtudiant(etudiantId);
    }
  };

  const openEditModal = (etudiant: Etudiant) => {
    setSelectedEtudiant(etudiant);
    setIsEditModalOpen(true);
  };

  const handleImport = (newEtudiants: Etudiant[]) => {
    // Ajouter les nouveaux étudiants à la liste locale
    // Le store sera mis à jour via fetchEtudiants si nécessaire
    fetchEtudiants();
    setIsImportModalOpen(false);
  };

  const handleExport = async () => {
    try {
      await exportEtudiants();
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'export des étudiants");
    }
  };

  // Calcul des statistiques
  const totalEtudiants = etudiants.length;
  const totalSolde = etudiants.reduce((sum, etudiant) => sum + (etudiant.solde || 0), 0);
  const etudiantsHommes = etudiants.filter(e => e.sexe === 'M').length;
  const etudiantsFemmes = etudiants.filter(e => e.sexe === 'F').length;
  const soldeMoyen = totalEtudiants > 0 ? totalSolde / totalEtudiants : 0;

  const columns = [
    {
      key: "photo" as keyof Etudiant,
      header: "Photo",
      render: (etudiant: Etudiant) => (
        <div className="flex items-center">
          {etudiant.photo ? (
            <img
              src={etudiant.photo}
              alt={`${etudiant.nom} ${etudiant.prenom}`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {etudiant.nom.charAt(0)}{etudiant.prenom.charAt(0)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "nom" as keyof Etudiant,
      header: "Nom complet",
      render: (etudiant: Etudiant) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {etudiant.nom} {etudiant.post_nom}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {etudiant.prenom}
          </div>
        </div>
      ),
    },
    {
      key: "matricule" as keyof Etudiant,
      header: "Matricule",
      render: (etudiant: Etudiant) => (
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
          {etudiant.matricule}
        </span>
      ),
    },
    {
      key: "sexe" as keyof Etudiant,
      header: "Sexe",
      render: (etudiant: Etudiant) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          etudiant.sexe === 'M' 
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
            : 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
        }`}>
          {etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'}
        </span>
      ),
    },
    {
      key: "nationalite" as keyof Etudiant,
      header: "Nationalité",
      render: (etudiant: Etudiant) => (
        <span className="text-gray-600 dark:text-gray-400">
          {etudiant.nationalite || 'Non spécifiée'}
        </span>
      ),
    },
    {
      key: "date_naissance" as keyof Etudiant,
      header: "Date de naissance",
      render: (etudiant: Etudiant) => {
        if (!etudiant.date_naissance) return <span className="text-gray-400">-</span>;
        const date = new Date(etudiant.date_naissance);
        return (
          <span className="text-gray-600 dark:text-gray-400">
            {date.toLocaleDateString('fr-FR')}
          </span>
        );
      },
    },
    {
      key: "solde" as keyof Etudiant,
      header: "Solde",
      render: (etudiant: Etudiant) => {
        const solde = etudiant.solde || 0;
        return (
          <span className={`font-medium ${
            solde >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {solde.toLocaleString('fr-FR')} CDF
          </span>
        );
      },
    },
    {
      key: "created_at" as keyof Etudiant,
      header: "Date d'inscription",
      render: (etudiant: Etudiant) => {
        const date = new Date(etudiant.created_at);
        return (
          <span className="text-gray-600 dark:text-gray-400">
            {date.toLocaleDateString('fr-FR')}
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des étudiants
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les étudiants de l'institut
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
              Importer CSV
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Exporter CSV
            </button>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nouvel étudiant
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total étudiants
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalEtudiants}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Hommes
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {etudiantsHommes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Femmes
                </p>
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {etudiantsFemmes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Solde total
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalSolde.toLocaleString('fr-FR')} CDF
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Solde moyen
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {soldeMoyen.toLocaleString('fr-FR')} CDF
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table des étudiants */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <DataTable
          data={etudiants}
          columns={columns}
          onAdd={() => setIsCreateModalOpen(true)}
          onEdit={openEditModal}
          onDelete={(etudiant) => handleDelete(etudiant._id)}
          addButtonText="Nouvel étudiant"
          searchPlaceholder="Rechercher un étudiant..."
        />
      </div>

      {/* Modals */}
      <EtudiantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Créer un nouvel étudiant"
      />

      <EtudiantModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEtudiant(null);
        }}
        onSubmit={handleEdit}
        etudiant={selectedEtudiant}
        title="Modifier l'étudiant"
      />

      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
