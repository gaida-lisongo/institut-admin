"use client";
import React, { useState } from "react";
import { Seance } from "@/services/CoursService";
import CoursService from "@/services/CoursService";
import DataTable, { Column } from "@/components/common/DataTable";
import SeanceModal from "./SeanceModal";

interface SeancesCardProps {
  seances: Seance[];
  titre: string;
  coursId: string;
  anneeId: string;
  onSeancesUpdate?: (seances: Seance[]) => void;
}

const SeancesCard: React.FC<SeancesCardProps> = ({
  seances,
  titre,
  coursId,
  anneeId,
  onSeancesUpdate,
}) => {
  const [localSeances, setLocalSeances] = useState<Seance[]>(seances);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeance, setEditingSeance] = useState<Seance | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const columns: Column<Seance>[] = [
    {
      key: "produitId",
      header: "ID Produit",
      sortable: true,
    },
    {
      key: "status",
      header: "Statut",
      render: (seance) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            seance.status === "OK"
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : seance.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {seance.status}
        </span>
      ),
      sortable: true,
    },
  ];

  const handleAdd = () => {
    setEditingSeance(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (seance: Seance) => {
    setEditingSeance(seance);
    setIsModalOpen(true);
  };

  const handleDelete = async (seance: Seance) => {
    if (!seance._id) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
      return;
    }

    setIsLoading(true);
    try {
      await CoursService.deleteSeance(coursId, seance._id);
      const updatedSeances = localSeances.filter((s) => s._id !== seance._id);
      setLocalSeances(updatedSeances);
      onSeancesUpdate?.(updatedSeances);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de la séance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (seanceData: Omit<Seance, '_id'> | Partial<Seance>) => {
    setIsLoading(true);
    try {
      let updatedSeances: Seance[];
      
      if (editingSeance?._id) {
        // Modification
        const updatedSeance = await CoursService.updateSeance(
          coursId,
          editingSeance._id,
          seanceData as Partial<Seance>
        );
        updatedSeances = localSeances.map((s) =>
          s._id === editingSeance._id ? updatedSeance : s
        );
      } else {
        // Création
        const newSeance = await CoursService.createSeance(
          coursId,
          seanceData as Omit<Seance, '_id'>
        );
        updatedSeances = [...localSeances, newSeance];
      }

      setLocalSeances(updatedSeances);
      onSeancesUpdate?.(updatedSeances);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde de la séance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {titre} - Séances
        </h3>
      </div>

      <DataTable
        data={localSeances}
        columns={columns}
        searchPlaceholder="Rechercher une séance..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="Nouvelle séance"
      />

      <SeanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        seance={editingSeance}
        anneeId={anneeId}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-white">Chargement...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeancesCard;
