"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable, { Column } from "@/components/common/DataTable";
import AnneeModal from "@/components/annees/AnneeModal";
import { useAnneeStore } from "@/stores/anneeStore";
import { useModal } from "@/hooks/useModal";
import { Annee } from "@/services/AnneeService";

export default function Annees() {
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedAnnee, setSelectedAnnee] = useState<Annee | null>(null);
  
  const {
    annees,
    isLoading,
    error,
    fetchAnnees,
    createAnnee,
    updateAnnee,
    deleteAnnee,
    clearError,
  } = useAnneeStore();

  useEffect(() => {
    fetchAnnees();
    console.log("Liste des années:", annees);
  }, [fetchAnnees]);

  const columns: Column<Annee>[] = [
    {
      key: "debut",
      header: "Année de début",
      sortable: true,
    },
    {
      key: "fin",
      header: "Année de fin",
      sortable: true,
    },
    {
      key: "motDg",
      header: "Mot du DG",
      render: (annee) => (
        <div className="flex items-center gap-2">
          {annee.motDg?.photo && (
            <img
              src={annee.motDg.photo}
              alt="Photo DG"
              className="w-8 h-8 object-cover rounded-full"
            />
          )}
          <span className={annee.motDg?.description ? "text-green-600" : "text-gray-400"}>
            {annee.motDg?.description ? "Configuré" : "Non configuré"}
          </span>
        </div>
      ),
      sortable: false,
    },
    {
      key: "articles",
      header: "Articles",
      render: (annee) => (
        <span className="text-sm text-gray-600">
          {annee.articles?.length || 0} article(s)
        </span>
      ),
      sortable: false,
    },
  ];

  const handleAdd = () => {
    setSelectedAnnee(null);
    openModal();
  };

  const handleEdit = (annee: Annee) => {
    setSelectedAnnee(annee);
    openModal();
  };

  const handleView = (annee: Annee) => {
    router.push(`/annees/${annee._id}`);
  };

  const handleDelete = async (annee: Annee) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'année ${annee.debut}-${annee.fin} ?`)) {
      return;
    }

    if (annee._id) {
      const success = await deleteAnnee(annee._id);
      if (success) {
        alert("Année supprimée avec succès");
      }
    }
  };

  const handleSave = async (data: Partial<Annee>) => {
    if (selectedAnnee && selectedAnnee._id) {
      await updateAnnee(selectedAnnee._id, data);
    } else {
      await createAnnee(data);
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center justify-between">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 dark:text-red-400"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Années Académiques
        </h1>
      </div>

      <DataTable
        data={annees}
        columns={columns}
        searchPlaceholder="Rechercher une année..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        addButtonText="Nouvelle année"
      />

      <AnneeModal
        isOpen={isOpen}
        onClose={closeModal}
        onSave={handleSave}
        annee={selectedAnnee}
        isLoading={isLoading}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-white">Chargement...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
