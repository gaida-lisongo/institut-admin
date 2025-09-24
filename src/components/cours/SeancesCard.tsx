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
  sectionId?: string; // Optionnel maintenant
  onSeancesUpdate?: (seances: Seance[]) => void;
}

const SeancesCard: React.FC<SeancesCardProps> = ({
  seances,
  titre,
  coursId,
  anneeId,
  sectionId,
  onSeancesUpdate,
}) => {
  const [localSeances, setLocalSeances] = useState<Seance[]>(seances);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeance, setEditingSeance] = useState<Seance | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const columns: Column<Seance>[] = [
    {
      key: "produit",
      header: "Produit",
      render: (seance) => (
        <div className="space-y-1">
          <div className="font-medium">
            {seance.produit?.designation || `ID: ${seance.produitId}`}
          </div>
          {seance.produit?.montant && (
            <div className="text-sm text-gray-500">
              {seance.produit.montant} CDF
            </div>
          )}
        </div>
      ),
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
      // Filtrer la séance à supprimer et nettoyer les _id
      const updatedSeances = localSeances
        .filter((s) => s._id !== seance._id)
        .map(s => {
          const { _id, ...cleanData } = s;
          return cleanData;
        });
      
      // Mettre à jour le cours entier avec les séances restantes
      const updatedCours = await CoursService.updateCours(coursId, { seances: updatedSeances });
      
      setLocalSeances(updatedCours.seances || []);
      onSeancesUpdate?.(updatedCours.seances || []);
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
      let updatedSeances: any[];
      
      if (editingSeance?._id) {
        // Modification - mettre à jour la séance existante
        updatedSeances = localSeances.map((s) => {
          if (s._id === editingSeance._id) {
            const updated = { ...s, ...seanceData };
            // Nettoyer l'objet pour MongoDB
            const { _id, ...cleanData } = updated;
            return cleanData;
          }
          // Pour les autres séances, nettoyer aussi
          const { _id, ...cleanData } = s;
          return cleanData;
        });
      } else {
        // Création - ajouter une nouvelle séance sans _id (MongoDB le générera)
        const newSeance = {
          ...seanceData as Omit<Seance, '_id'>
        };
        
        // Nettoyer toutes les séances existantes (enlever les _id)
        const cleanedExistingSeances = localSeances.map(s => {
          const { _id, ...cleanData } = s;
          return cleanData;
        });
        
        updatedSeances = [...cleanedExistingSeances, newSeance];
      }

      // Mettre à jour le cours entier avec les nouvelles séances
      const updatedCours = await CoursService.updateCours(coursId, { seances: updatedSeances });
      
      // Récupérer les séances avec les nouveaux IDs générés par MongoDB
      setLocalSeances(updatedCours.seances || []);
      onSeancesUpdate?.(updatedCours.seances || []);
      setIsModalOpen(false);
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
        sectionId={sectionId}
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
