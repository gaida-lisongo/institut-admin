"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useChargeStore } from "@/stores/chargeStore";
import { useCoursStore } from "@/stores/coursStore";
import { useAnneeStore } from "@/stores/anneeStore";
import { useAgentStore } from "@/stores/agentStore";
import DataTable, { Column } from "@/components/common/DataTable";
import { ChargeWithDetails } from "@/services/ChargeService";

// Composant de sélection avec recherche
interface SearchableSelectProps {
  items: { _id: string; label: string; subtitle?: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  items,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [items, searchTerm]);

  const selectedItem = items.find(item => item._id === value);

  const handleSelect = (itemId: string) => {
    onChange(itemId);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-left flex items-center justify-between ${
          !selectedItem && required ? 'border-red-300 dark:border-red-600' : ''
        }`}
      >
        <span className={selectedItem ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <span className="ml-2">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Barre de recherche */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Liste des options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-2 text-gray-500 dark:text-gray-400 text-sm">
                Aucun résultat trouvé
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleSelect(item._id)}
                  className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </div>
                  {item.subtitle && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item.subtitle}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm("");
          }}
        />
      )}
    </div>
  );
};

// Modal améliorée avec recherche
interface ChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  charge?: ChargeWithDetails | null;
  anneeId: string;
}

const ChargeModal: React.FC<ChargeModalProps> = ({ isOpen, onClose, charge, anneeId }) => {
  const { createCharge, updateCharge } = useChargeStore();
  const { cours } = useCoursStore();
  const { agents } = useAgentStore();
  
  const [formData, setFormData] = useState({
    agentId: "",
    coursId: "",
    status: "pending" as "ok" | "pending" | "no",
  });

  const [errors, setErrors] = useState({
    agentId: false,
    coursId: false,
  });

  useEffect(() => {
    if (charge) {
      setFormData({
        agentId: typeof charge.agentId === 'object' ? charge.agentId._id : charge.agentId,
        coursId: typeof charge.coursId === 'object' ? charge.coursId._id : charge.coursId,
        status: charge.status || "pending",
      });
    } else {
      setFormData({
        agentId: "",
        coursId: "",
        status: "pending",
      });
    }
    setErrors({ agentId: false, coursId: false });
  }, [charge, isOpen]);

  // Préparer les données pour les composants de recherche
  const coursItems = useMemo(() => 
    cours
      .filter(c => c._id) // Filter out items without _id
      .map(c => ({
        _id: c._id!,
        label: c.titre,
        subtitle: `${c.credit} crédit${c.credit > 1 ? 's' : ''} - ${c.description || 'Pas de description'}`
      }))
  , [cours]);

  const agentItems = useMemo(() => 
    agents
      .filter(agent => agent._id) // Filter out items without _id
      .map(agent => ({
        _id: agent._id!,
        label: `${agent.nom} ${agent.prenom}`,
        subtitle: `${agent.grade || 'Grade non défini'} - ${agent.titre || 'Titre non défini'}`
      }))
  , [agents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {
      agentId: !formData.agentId,
      coursId: !formData.coursId,
    };
    
    setErrors(newErrors);
    
    if (newErrors.agentId || newErrors.coursId) {
      return;
    }

    try {
      if (charge?._id) {
        await updateCharge(charge._id, formData);
      } else {
        await createCharge({ ...formData, anneeId });
      }
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
          {charge ? "Modifier" : "Créer"} une charge horaire
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du cours */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Cours <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              items={coursItems}
              value={formData.coursId}
              onChange={(value) => {
                setFormData({ ...formData, coursId: value });
                setErrors({ ...errors, coursId: false });
              }}
              placeholder="Sélectionner un cours"
              searchPlaceholder="Rechercher un cours..."
              required
            />
            {errors.coursId && (
              <p className="text-red-500 text-sm mt-1">Veuillez sélectionner un cours</p>
            )}
          </div>

          {/* Sélection de l'enseignant */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Enseignant <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              items={agentItems}
              value={formData.agentId}
              onChange={(value) => {
                setFormData({ ...formData, agentId: value });
                setErrors({ ...errors, agentId: false });
              }}
              placeholder="Sélectionner un enseignant"
              searchPlaceholder="Rechercher un enseignant..."
              required
            />
            {errors.agentId && (
              <p className="text-red-500 text-sm mt-1">Veuillez sélectionner un enseignant</p>
            )}
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "ok" | "pending" | "no" })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">⏳ En attente</option>
              <option value="ok">✅ Confirmé</option>
              <option value="no">❌ Refusé</option>
            </select>
          </div>

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {charge ? "💾 Modifier" : "➕ Créer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              ❌ Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ChargesByAnneePage() {
  const params = useParams();
  const anneeId = params.slug as string;

  const { currentAnneeCharges: charges, loading, fetchChargesByAnnee, deleteCharge } = useChargeStore();
  const { cours, fetchCours } = useCoursStore();
  const { selectedAnnee: currentAnnee, fetchAnnee } = useAnneeStore();
  const { agents, fetchAgents } = useAgentStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<ChargeWithDetails | null>(null);

  useEffect(() => {
    if (anneeId) {
      fetchChargesByAnnee(anneeId);
      fetchAnnee(anneeId);
      fetchCours();
      fetchAgents();
    }
  }, [anneeId, fetchChargesByAnnee, fetchAnnee, fetchCours, fetchAgents]);

  const columns: Column<ChargeWithDetails>[] = [
    {
      key: "coursId" as keyof ChargeWithDetails,
      header: "Cours",
      render: (charge) => {
        const cours = typeof charge.coursId === 'object' ? charge.coursId : null;
        return (
          <div>
            <div className="font-medium">{cours?.titre || 'Cours inconnu'}</div>
            <div className="text-sm text-gray-500">{cours?.credit || 0} crédit(s)</div>
          </div>
        );
      },
    },
    {
      key: "agentId" as keyof ChargeWithDetails,
      header: "Enseignant",
      render: (charge) => {
        const agent = typeof charge.agentId === 'object' ? charge.agentId : null;
        return (
          <div>
            <div className="font-medium">
              {agent ? `${agent.nom} ${agent.prenom}` : 'Enseignant inconnu'}
            </div>
            <div className="text-sm text-gray-500">{agent?.grade || 'Grade non défini'}</div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Statut",
      render: (charge) => {
        const statusColors = {
          ok: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          no: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
        
        const statusLabels = {
          ok: "✅ Confirmé",
          pending: "⏳ En attente",
          no: "❌ Refusé",
        };

        return (
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[charge.status || "pending"]
          }`}>
            {statusLabels[charge.status || "pending"]}
          </span>
        );
      },
    },
  ];

  const handleAdd = () => {
    setSelectedCharge(null);
    setIsModalOpen(true);
  };

  const handleEdit = (charge: ChargeWithDetails) => {
    setSelectedCharge(charge);
    setIsModalOpen(true);
  };

  const handleDelete = async (charge: ChargeWithDetails) => {
    if (!charge._id) return;
    
    const cours = typeof charge.coursId === 'object' ? charge.coursId : null;
    if (confirm(`Supprimer la charge "${cours?.titre || 'cours inconnu'}" ?`)) {
      try {
        await deleteCharge(charge._id);
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCharge(null);
  };

  if (loading && charges.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <span className="mr-2">←</span>
              Retour
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Charges Horaires - {currentAnnee?.debut}-{currentAnnee?.fin}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestion des charges horaires pour l'année académique {currentAnnee?.debut}-{currentAnnee?.fin}
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {charges.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Confirmées
                    </dt>
                    <dd className="text-lg font-medium text-green-600">
                      {charges.filter(c => c.status === "ok").length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      En attente
                    </dt>
                    <dd className="text-lg font-medium text-yellow-600">
                      {charges.filter(c => c.status === "pending").length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">❌</span>
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Refusées
                    </dt>
                    <dd className="text-lg font-medium text-red-600">
                      {charges.filter(c => c.status === "no").length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <DataTable
            data={charges}
            columns={columns}
            searchPlaceholder="Rechercher par cours ou enseignant..."
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            addButtonText="➕ Nouvelle charge"
          />
        </div>

        {/* Modal */}
        <ChargeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          charge={selectedCharge}
          anneeId={anneeId}
        />
      </div>
    </div>
  );
}