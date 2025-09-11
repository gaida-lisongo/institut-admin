"use client";
import React, { useEffect, useState } from "react";
import TeamModal from "@/components/team/TeamModal";
import { useSectionStore, type Section, type Team } from "@/stores/sectionStore";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function EquipePage() {
  const {
    sections,
    isLoading,
    fetchSections,
    addTeamMemberToSection,
    updateTeamMemberInSection,
    removeTeamMemberFromSection,
  } = useSectionStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{member: Team, sectionId: string, index: number} | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleCreate = async (member: Team) => {
    if (selectedSectionId === "all" || !selectedSectionId) {
      alert("Veuillez sélectionner une section");
      return;
    }
    
    const success = await addTeamMemberToSection(selectedSectionId, member);
    if (success) {
      setIsCreateModalOpen(false);
    }
  };

  const handleEdit = async (member: Team) => {
    if (!selectedMember) return;
    
    const success = await updateTeamMemberInSection(selectedMember.sectionId, selectedMember.index, member);
    if (success) {
      setIsEditModalOpen(false);
      setSelectedMember(null);
    }
  };

  const handleDelete = async (item: {sectionId: string, sectionName: string, member: Team, index: number}) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce membre de l'équipe ?")) {
      await removeTeamMemberFromSection(item.sectionId, item.index);
    }
  };

  const openEditModal = (item: {sectionId: string, sectionName: string, member: Team, index: number}) => {
    setSelectedMember({
      member: item.member,
      sectionId: item.sectionId,
      index: item.index
    });
    setIsEditModalOpen(true);
  };

  // Récupérer tous les membres d'équipe avec leurs informations de section
  const allTeamMembers = sections.flatMap(section => 
    section.team.map((member, index) => ({
      sectionId: section._id || '',
      sectionName: section.description.sigle,
      member,
      index
    }))
  );

  // Filtrer les membres par section et terme de recherche
  const filteredMembers = allTeamMembers
    .filter(item => selectedSectionId === "all" || item.sectionId === selectedSectionId)
    .filter(item => 
      item.member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.member.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.member.fonction.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Statistiques
  const totalMembers = allTeamMembers.length;

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion de l'équipe administrative
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les membres de l'équipe administrative par section
            </p>
          </div>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nouveau membre
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Recherche */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un membre de l'équipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filtre par section */}
          <div className="w-full sm:w-64">
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Toutes les sections</option>
              {sections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.description.sigle} - {section.description.designation}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total membres
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalMembers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sections actives
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {sections.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Membres filtrés
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {filteredMembers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Moyenne par section
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {sections.length > 0 ? Math.round(totalMembers / sections.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid des membres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Membres de l'équipe administrative
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredMembers.length} membre(s) trouvé(s)
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">👥</div>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedSectionId === "all" 
                  ? "Aucun membre d'équipe trouvé" 
                  : "Aucun membre dans cette section"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((item, index) => (
                <div
                  key={`${item.sectionId}-${item.index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {item.member.photo ? (
                        <img
                          src={item.member.photo}
                          alt={item.member.nom}
                          className="w-20 h-20 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {item.member.grade} {item.member.nom}
                      </h4>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                        {item.member.fonction}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {item.sectionName}
                      </span>
                    </div>

                    <div className="flex justify-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Modifier"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Créer un nouveau membre"
      />

      <TeamModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}
        onSubmit={handleEdit}
        teamMember={selectedMember?.member}
        title="Modifier le membre"
      />
    </div>
  );
}
