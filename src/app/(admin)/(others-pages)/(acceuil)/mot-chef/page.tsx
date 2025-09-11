"use client";
import React, { useEffect, useState } from "react";
import MotChefModal from "@/components/mot-chef/MotChefModal";
import { useSectionStore, type Section, type MotChef } from "@/stores/sectionStore";
import { PlusIcon, MagnifyingGlassIcon, UserIcon, PencilIcon } from "@heroicons/react/24/outline";

export default function MotChefPage() {
  const {
    sections,
    isLoading,
    fetchSections,
    updateMotChefInSection,
  } = useSectionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{section: Section, motChef?: MotChef} | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleSubmit = async (motChef: MotChef) => {
    if (!selectedSection) return;
    
    const success = await updateMotChefInSection(selectedSection.section._id!, motChef);
    if (success) {
      setIsModalOpen(false);
      setSelectedSection(null);
    }
  };

  const openModal = (section: Section) => {
    setSelectedSection({
      section,
      motChef: section.description.motChef
    });
    setIsModalOpen(true);
  };

  // Filtrer les sections par terme de recherche
  const filteredSections = sections
    .filter(section => selectedSectionId === "all" || section._id === selectedSectionId)
    .filter(section => 
      section.description.sigle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Statistiques
  const totalSections = sections.length;
  const sectionsAvecMotChef = sections.filter(section => 
    section.description.motChef?.description?.trim()
  ).length;

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mot du chef de section
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les messages des chefs de section
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Recherche */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une section..."
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
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total sections
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalSections}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avec mot du chef
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {sectionsAvecMotChef}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sans mot du chef
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {totalSections - sectionsAvecMotChef}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sections filtrées
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Sections et messages des chefs
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredSections.length} section(s) trouvée(s)
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {selectedSectionId === "all" 
                  ? "Aucune section trouvée" 
                  : "Aucune section ne correspond aux critères de recherche"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSections.map((section) => (
                <div
                  key={section._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-shrink-0">
                          {section.description.motChef?.photo ? (
                            <img
                              src={section.description.motChef.photo}
                              alt={`Chef de ${section.description.sigle}`}
                              className="w-16 h-16 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {section.description.sigle}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              section.description.motChef?.description?.trim()
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {section.description.motChef?.description?.trim() ? "Configuré" : "Non configuré"}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {section.description.designation}
                          </p>
                        </div>
                      </div>

                      {section.description.motChef?.description?.trim() ? (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                            Message du chef de section :
                          </h5>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                            {section.description.motChef.description}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                            Aucun message du chef de section n&apos;a encore été configuré pour cette section.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => openModal(section)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title={section.description.motChef?.description?.trim() ? "Modifier" : "Ajouter"}
                      >
                        {section.description.motChef?.description?.trim() ? (
                          <PencilIcon className="w-5 h-5" />
                        ) : (
                          <PlusIcon className="w-5 h-5" />
                        )}
                      </button>
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
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSection(null);
        }}
        onSubmit={handleSubmit}
        motChef={selectedSection?.motChef}
        title={selectedSection?.motChef?.description?.trim() 
          ? `Modifier le mot du chef - ${selectedSection.section.description.sigle}`
          : `Ajouter un mot du chef - ${selectedSection?.section.description.sigle}`
        }
      />
    </div>
  );
}
