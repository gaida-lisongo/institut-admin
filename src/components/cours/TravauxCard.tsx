"use client";
import React, { useState } from "react";
import { Travail } from "@/services/CoursService";
import CoursService from "@/services/CoursService";
import DataTable, { Column } from "@/components/common/DataTable";
import TravailModal from "./TravailModal";

interface TravauxCardProps {
  travaux: Travail[];
  titre: string;
  coursId: string;
  anneeId: string;
  sectionId?: string; // Optionnel maintenant
  onTravauxUpdate?: (travaux: Travail[]) => void;
}

const TravauxCard: React.FC<TravauxCardProps> = ({
  travaux,
  titre,
  coursId,
  anneeId,
  sectionId,
  onTravauxUpdate,
}) => {
  const [localTravaux, setLocalTravaux] = useState<Travail[]>(travaux);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTravail, setEditingTravail] = useState<Travail | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const columns: Column<Travail>[] = [
    {
      key: "produitId",
      header: "Produit",
      render: (travail) => (
        <div className="space-y-1">
          <div className="font-medium">
            {travail.produit?.designation || `ID: ${travail.produitId}`}
          </div>
          {travail.produit?.montant && (
            <div className="text-sm text-gray-500">
              {travail.produit.montant} CDF
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: "questionnaire",
      header: "Questionnaire",
      render: (travail) => (
        <a
          href={travail.questionnaire}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Voir PDF
        </a>
      ),
      sortable: false,
    },
    {
      key: "status",
      header: "Statut",
      render: (travail) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            travail.status === "OK"
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : travail.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {travail.status}
        </span>
      ),
      sortable: true,
    },
  ];

  const handleAdd = () => {
    setEditingTravail(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (travail: Travail) => {
    setEditingTravail(travail);
    setIsModalOpen(true);
  };

  const handleDelete = async (travail: Travail) => {
    if (!travail._id) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce travail ?")) {
      return;
    }

    setIsLoading(true);
    try {
      // Filtrer le travail à supprimer et nettoyer les _id
      const updatedTravaux = localTravaux
        .filter((t) => t._id !== travail._id)
        .map(t => {
          const { _id, ...cleanData } = t;
          return cleanData;
        });
      
      // Mettre à jour le cours entier avec les travaux restants
      const updatedCours = await CoursService.updateCours(coursId, { travaux: updatedTravaux });
      
      setLocalTravaux(updatedCours.travaux || []);
      onTravauxUpdate?.(updatedCours.travaux || []);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du travail");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (travailData: Omit<Travail, '_id'> | Partial<Travail>) => {
    setIsLoading(true);
    try {
      let updatedTravaux: any[];
      
      if (editingTravail?._id) {
        // Modification - mettre à jour le travail existant
        updatedTravaux = localTravaux.map((t) => {
          if (t._id === editingTravail._id) {
            const updated = { ...t, ...travailData };
            // Nettoyer l'objet pour MongoDB
            const { _id, ...cleanData } = updated;
            return cleanData;
          }
          // Pour les autres travaux, nettoyer aussi
          const { _id, ...cleanData } = t;
          return cleanData;
        });
      } else {
        // Création - ajouter un nouveau travail sans _id (MongoDB le générera)
        const newTravail = {
          ...travailData as Omit<Travail, '_id'>
        };
        
        // Nettoyer tous les travaux existants (enlever les _id)
        const cleanedExistingTravaux = localTravaux.map(t => {
          const { _id, ...cleanData } = t;
          return cleanData;
        });
        
        updatedTravaux = [...cleanedExistingTravaux, newTravail];
      }

      // Mettre à jour le cours entier avec les nouveaux travaux
      const updatedCours = await CoursService.updateCours(coursId, { travaux: updatedTravaux });
      
      // Récupérer les travaux avec les nouveaux IDs générés par MongoDB
      setLocalTravaux(updatedCours.travaux || []);
      onTravauxUpdate?.(updatedCours.travaux || []);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde du travail");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {titre} - Travaux
        </h3>
      </div>

      <DataTable
        data={localTravaux}
        columns={columns}
        searchPlaceholder="Rechercher un travail..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="Nouveau travail"
      />

      <TravailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        travail={editingTravail}
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

export default TravauxCard;