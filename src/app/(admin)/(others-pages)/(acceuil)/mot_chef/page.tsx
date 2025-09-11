"use client";
import React, { useEffect, useState } from "react";
import MotChefModal from "@/components/mot-chef/MotChefModal";
import { useSectionStore, type Section, type MotChef } from "@/stores/sectionStore";
import { PlusIcon, PencilIcon, UserIcon, PhotoIcon } from "@heroicons/react/24/outline";

export default function MotChefPage() {
  const {
    sections,
    isLoading,
    fetchSections,
    updateMotChefInSection,
  } = useSectionStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleEdit = async (motChef: MotChef) => {
    if (!selectedSection?._id) return;
    
    const success = await updateMotChefInSection(selectedSection._id, motChef);
    if (success) {
      setIsEditModalOpen(false);
      setSelectedSection(null);
    }
  };

  const openEditModal = (section: Section) => {
    setSelectedSection(section);
    setIsEditModalOpen(true);
  };

  // Filtrer les sections par terme de recherche
  const filteredSections = sections.filter(section => 
    section.description.sigle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques
  const sectionsAvecMotChef = sections.filter(section => 
    section.description.motChef?.description && section.description.motChef.description.trim() !== ''
  ).length;
  const sectionsAvecPhoto = sections.filter(section => 
    section.description.motChef?.photo && section.description.motChef.photo.trim() !== ''
  ).length;

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des mots du chef de section
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les messages des chefs de section
            </p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Rechercher une section..."
            />
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total sections
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sections.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avec message
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {sectionsAvecMotChef}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <PhotoIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avec photo
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {sectionsAvecPhoto}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sections filtrées
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {filteredSections.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des sections */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Sections disponibles
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Aucune section trouvée
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Aucune section ne correspond à votre recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSections.map((section) => (
                <div
                  key={section._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {section.description.sigle}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {section.description.designation}
                      </p>
                    </div>
                    <button
                      onClick={() => openEditModal(section)}
                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Modifier
                    </button>
                  </div>

                  {/* Photo du chef */}
                  <div className="mb-4">
                    {section.description.motChef?.photo ? (
                      <img
                        src={section.description.motChef.photo}
                        alt={`Chef de ${section.description.sigle}`}
                        className="w-16 h-16 object-cover rounded-full border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Message du chef */}
                  <div>
                    {section.description.motChef?.description ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {section.description.motChef.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        Aucun message configuré
                      </p>
                    )}
                  </div>

                  {/* Statut */}
                  <div className="mt-4 flex items-center space-x-4">
                    <div className={`flex items-center text-xs ${
                      section.description.motChef?.photo 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-400'
                    }`}>
                      <PhotoIcon className="w-4 h-4 mr-1" />
                      Photo
                    </div>
                    <div className={`flex items-center text-xs ${
                      section.description.motChef?.description 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-400'
                    }`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Message
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <MotChefModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSection(null);
        }}
        onSubmit={handleEdit}
        motChef={selectedSection?.description.motChef}
        title={`Mot du chef - ${selectedSection?.description.sigle}`}
      />
    </div>
  );
}
