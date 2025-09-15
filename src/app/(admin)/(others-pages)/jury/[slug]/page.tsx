"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useJuryStore } from "@/stores/juryStore";
import { useAnneeStore } from "@/stores/anneeStore";
import { useSectionStore } from "@/stores/sectionStore";
import { useAgentStore } from "@/stores/agentStore";
import DataTable, { Column } from "@/components/common/DataTable";
import { JuryWithDetails, JuryFormData, Bureau } from "@/services/JuryService";

// Modal pour le CRUD des jurys
interface JuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  jury?: JuryWithDetails | null;
  anneeId: string;
  sectionId: string;
}

const JuryModal: React.FC<JuryModalProps> = ({ isOpen, onClose, jury, anneeId, sectionId }) => {
  const { createJury, updateJury } = useJuryStore();
  const { agents } = useAgentStore();
  
  const [formData, setFormData] = useState<JuryFormData>({
    anneId: anneeId,
    sectionId: sectionId,
    designation: "",
    code: "",
    bureau: [],
  });

  const [newBureauMember, setNewBureauMember] = useState({
    agentId: "",
    fonction: "Membre" as "Président" | "Secrétaire" | "Membre"
  });

  useEffect(() => {
    if (jury) {
      setFormData({
        anneId: typeof jury.anneId === 'object' ? jury.anneId._id : jury.anneId,
        sectionId: typeof jury.sectionId === 'object' ? jury.sectionId._id : jury.sectionId,
        designation: jury.designation,
        code: jury.code,
        bureau: jury.bureau.map(b => ({
          agentId: typeof b.agentId === 'object' ? b.agentId._id : b.agentId,
          fonction: b.fonction
        })),
      });
    } else {
      setFormData({
        anneId: anneeId,
        sectionId: sectionId,
        designation: "",
        code: "",
        bureau: [],
      });
    }
  }, [jury, anneeId, sectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (jury?._id) {
        await updateJury(jury._id, formData);
      } else {
        await createJury(formData);
      }
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const addBureauMember = () => {
    if (newBureauMember.agentId && newBureauMember.fonction) {
      // Vérifier si l'agent n'est pas déjà dans le bureau
      const existingMember = formData.bureau.find(b => b.agentId === newBureauMember.agentId);
      if (existingMember) {
        alert("Cet agent fait déjà partie du bureau");
        return;
      }

      // Vérifier les contraintes de fonction
      if (newBureauMember.fonction === "Président") {
        const hasPresident = formData.bureau.some(b => b.fonction === "Président");
        if (hasPresident) {
          alert("Il ne peut y avoir qu'un seul Président");
          return;
        }
      }

      if (newBureauMember.fonction === "Secrétaire") {
        const hasSecretary = formData.bureau.some(b => b.fonction === "Secrétaire");
        if (hasSecretary) {
          alert("Il ne peut y avoir qu'un seul Secrétaire");
          return;
        }
      }

      setFormData({
        ...formData,
        bureau: [...formData.bureau, { ...newBureauMember }]
      });
      
      setNewBureauMember({
        agentId: "",
        fonction: "Membre"
      });
    }
  };

  const removeBureauMember = (index: number) => {
    setFormData({
      ...formData,
      bureau: formData.bureau.filter((_, i) => i !== index)
    });
  };

  const getAgentName = (agentId: string) => {
    console.log("Searching for agentId:", agentId);
    console.log("Available agents:", agents);
    const agent = agents.find(a => a._id === agentId);
    return agent ? `${agent.nom} ${agent.prenom}` : "Agent inconnu";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
          {jury ? "Modifier" : "Créer"} un bureau de jury
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Désignation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Ex: Bureau de jury L1 Génie Civil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Ex: BJL1GC2024"
              />
            </div>
          </div>

          {/* Composition du bureau */}
          <div>
            <label className="block text-sm font-medium mb-4">Composition du bureau</label>
            
            {/* Ajouter un membre */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <select
                  value={newBureauMember.agentId}
                  onChange={(e) => setNewBureauMember({ ...newBureauMember, agentId: e.target.value })}
                  className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
                >
                  <option value="">Sélectionner un agent</option>
                  {agents.filter(agent => 
                    !formData.bureau.some(b => b.agentId === agent._id)
                  ).map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.nom} {agent.prenom} - {agent.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={newBureauMember.fonction}
                  onChange={(e) => setNewBureauMember({ 
                    ...newBureauMember, 
                    fonction: e.target.value as "Président" | "Secrétaire" | "Membre" 
                  })}
                  className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
                >
                  <option value="Membre">Membre</option>
                  <option value="Secrétaire" disabled={formData.bureau.some(b => b.fonction === "Secrétaire")}>
                    Secrétaire {formData.bureau.some(b => b.fonction === "Secrétaire") && "(Déjà assigné)"}
                  </option>
                  <option value="Président" disabled={formData.bureau.some(b => b.fonction === "Président")}>
                    Président {formData.bureau.some(b => b.fonction === "Président") && "(Déjà assigné)"}
                  </option>
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={addBureauMember}
                  disabled={!newBureauMember.agentId}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  ➕ Ajouter
                </button>
              </div>
            </div>

            {/* Liste des membres du bureau */}
            <div className="space-y-2">
              {formData.bureau.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        member.fonction === 'Président' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : member.fonction === 'Secrétaire'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {member.fonction}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {typeof member.agentId === 'object' 
                          ? `${member.agentId.nom} ${member.agentId.prenom}` 
                          : getAgentName(member.agentId)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBureauMember(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ❌
                  </button>
                </div>
              ))}
              
              {formData.bureau.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Aucun membre ajouté au bureau
                </p>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {jury ? "💾 Modifier" : "➕ Créer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              ❌ Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function JuryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Parse du slug format: anneeId-sectionId
  const [anneeId, sectionId] = slug.split('-');

  const { juries, loading, fetchJuriesByAnneeAndSection, deleteJury } = useJuryStore();
  const { selectedAnnee: currentAnnee, fetchAnnee } = useAnneeStore();
  const { sections, fetchSections } = useSectionStore();
  const { agents, fetchAgents } = useAgentStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJury, setSelectedJury] = useState<JuryWithDetails | null>(null);

  // Récupérer les informations de la section courante
  const currentSection = useMemo(() => {
    return sections.find(s => s._id === sectionId);
  }, [sections, sectionId]);

  useEffect(() => {
    if (anneeId && sectionId) {
      fetchJuriesByAnneeAndSection(anneeId, sectionId);
      fetchAnnee(anneeId);
      fetchSections();
      fetchAgents();
    }
  }, [anneeId, sectionId, fetchJuriesByAnneeAndSection, fetchAnnee, fetchSections, fetchAgents]);

  const columns: Column<JuryWithDetails>[] = [
    {
      key: "designation",
      header: "Bureau de jury",
      render: (jury) => (
        <div>
          <div className="font-medium">{jury.designation}</div>
          <div className="text-sm text-gray-500">{jury.code}</div>
        </div>
      ),
    },
    {
      key: "bureau",
      header: "Composition",
      render: (jury) => (
        <div className="space-y-1">
          {jury.bureau.slice(0, 3).map((member, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                member.fonction === 'Président' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : member.fonction === 'Secrétaire'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {member.fonction}
              </span>
              {/* <span className="text-sm">
                {typeof member.agentId === 'string' 
                  ? `${member.nom} ${member.prenom}` 
                  : 'Agent inconnu'}
              </span> */}
            </div>
          ))}
          {jury.bureau.length > 3 && (
            <span className="text-xs text-gray-500">
              +{jury.bureau.length - 3} autres membres
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Créé le",
      render: (jury) => (
        <div className="text-sm">
          {jury.createdAt ? new Date(jury.createdAt).toLocaleDateString('fr-FR') : '-'}
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setSelectedJury(null);
    setIsModalOpen(true);
  };

  const handleEdit = (jury: JuryWithDetails) => {
    setSelectedJury(jury);
    setIsModalOpen(true);
  };

  const handleDelete = async (jury: JuryWithDetails) => {
    if (!jury._id) return;
    
    if (confirm(`Supprimer le bureau "${jury.designation}" ?`)) {
      try {
        await deleteJury(jury._id);
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJury(null);
  };

  if (loading && juries.length === 0) {
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
            Bureaux de Jury - {currentSection?.description.sigle}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {currentSection?.description.designation} - Année {currentAnnee?.debut}-{currentAnnee?.fin}
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚖️</span>
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Bureaux
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {juries.length}
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
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Membres
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {juries.reduce((total, jury) => total + jury.bureau.length, 0)}
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
                  <span className="text-2xl">👑</span>
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Présidents
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {juries.filter(jury => 
                        jury.bureau.some(member => member.fonction === 'Président')
                      ).length}
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
            data={juries}
            columns={columns}
            searchPlaceholder="Rechercher un bureau de jury..."
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            addButtonText="⚖️ Nouveau bureau"
          />
        </div>

        {/* Modal */}
        <JuryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          jury={selectedJury}
          anneeId={anneeId}
          sectionId={sectionId}
        />
      </div>
    </div>
  );
}