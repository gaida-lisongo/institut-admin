"use client";
import React, { useEffect, useState } from "react";
import AlumnModal from "@/components/alumni/AlumnModal";
import { useSectionStore, type Section, type Alumn } from "@/stores/sectionStore";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function AlumniPage() {
  const {
    sections,
    isLoading,
    fetchSections,
    addAlumnToSection,
    updateAlumnInSection,
    removeAlumnFromSection,
  } = useSectionStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAlumn, setSelectedAlumn] = useState<{alumn: Alumn, sectionId: string, index: number} | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleCreate = async (alumn: Alumn) => {
    if (selectedSectionId === "all" || !selectedSectionId) {
      alert("Veuillez sélectionner une section");
      return;
    }
    
    const success = await addAlumnToSection(selectedSectionId, alumn);
    if (success) {
      setIsCreateModalOpen(false);
    }
  };

  const handleEdit = async (alumn: Alumn) => {
    if (!selectedAlumn) return;
    
    const success = await updateAlumnInSection(selectedAlumn.sectionId, selectedAlumn.index, alumn);
    if (success) {
      setIsEditModalOpen(false);
      setSelectedAlumn(null);
    }
  };

  const handleDelete = async (item: {sectionId: string, sectionName: string, alumn: Alumn, index: number}) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet alumni ?")) {
      await removeAlumnFromSection(item.sectionId, item.index);
    }
  };

  const openEditModal = (item: {sectionId: string, sectionName: string, alumn: Alumn, index: number}) => {
    setSelectedAlumn({
      alumn: item.alumn,
      sectionId: item.sectionId,
      index: item.index
    });
    setIsEditModalOpen(true);
  };

  // Récupérer tous les alumni avec leurs informations de section
  const allAlumni = sections.flatMap(section => 
    section.alumni.map((alumn, index) => ({
      sectionId: section._id || '',
      sectionName: section.description.sigle,
      alumn,
      index
    }))
  );

  // Filtrer les alumni par section et terme de recherche
  const filteredAlumni = allAlumni
    .filter(item => selectedSectionId === "all" || item.sectionId === selectedSectionId)
    .filter(item => 
      item.alumn.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alumn.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alumn.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Statistiques
  const totalAlumni = allAlumni.length;
  const alumniParSection = sections.map(section => ({
    section: section.description.sigle,
    count: section.alumni.length
  }));

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des alumni
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les anciens étudiants par section
            </p>
          </div>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nouvel alumni
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Recherche */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un alumni..."
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total alumni
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalAlumni}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Alumni filtrés
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {filteredAlumni.length}
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
                  {sections.length > 0 ? Math.round(totalAlumni / sections.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid des alumni */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Alumni
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAlumni.length} alumni trouvé(s)
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">🎓</div>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedSectionId === "all" 
                  ? "Aucun alumni trouvé" 
                  : "Aucun alumni dans cette section"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map((item, index) => (
                <div
                  key={`${item.sectionId}-${item.index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {item.alumn.photo ? (
                        <img
                          src={item.alumn.photo}
                          alt={item.alumn.nom}
                          className="w-16 h-16 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {item.alumn.nom}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ml-2">
                          {item.sectionName}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                        {item.alumn.titre}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {item.alumn.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AlumnModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Créer un nouvel alumni"
      />

      <AlumnModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAlumn(null);
        }}
        onSubmit={handleEdit}
        alumn={selectedAlumn?.alumn}
        title="Modifier l'alumni"
      />
    </div>
  );
}
