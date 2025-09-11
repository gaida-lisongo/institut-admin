"use client";
import React, { useEffect, useState } from "react";
import DataTable from "@/components/common/DataTable";
import OffreModal from "@/components/offres/OffreModal";
import { useSectionStore, type Section, type Offre } from "@/stores/sectionStore";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function OffresPage() {
  const {
    sections,
    isLoading,
    fetchSections,
    addOffreToSection,
    updateOffreInSection,
    removeOffreFromSection,
    getAllOffres,
  } = useSectionStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState<{offre: Offre, sectionId: string, index: number} | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleCreate = async (offre: Offre) => {
    if (selectedSectionId === "all" || !selectedSectionId) {
      alert("Veuillez sélectionner une section");
      return;
    }
    
    const success = await addOffreToSection(selectedSectionId, offre);
    if (success) {
      setIsCreateModalOpen(false);
    }
  };

  const handleEdit = async (offre: Offre) => {
    if (!selectedOffre) return;
    
    const success = await updateOffreInSection(selectedOffre.sectionId, selectedOffre.index, offre);
    if (success) {
      setIsEditModalOpen(false);
      setSelectedOffre(null);
    }
  };

  const handleDelete = async (item: {sectionId: string, sectionName: string, offre: Offre, index: number}) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      await removeOffreFromSection(item.sectionId, item.index);
    }
  };

  const openEditModal = (item: {sectionId: string, sectionName: string, offre: Offre, index: number}) => {
    setSelectedOffre({
      offre: item.offre,
      sectionId: item.sectionId,
      index: item.index
    });
    setIsEditModalOpen(true);
  };

  // Récupérer toutes les offres avec leurs informations de section
  const allOffres = getAllOffres();

  // Filtrer les offres par section et terme de recherche
  const filteredOffres = allOffres
    .filter(item => selectedSectionId === "all" || item.sectionId === selectedSectionId)
    .filter(item => 
      item.offre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.offre.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Statistiques
  const totalOffres = allOffres.length;
  const offresParSection = sections.map(section => ({
    section: section.description.sigle,
    count: section.offres.length
  }));

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des offres de formation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les offres de formation par section
            </p>
          </div>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nouvelle offre
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total offres
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalOffres}
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

          {offresParSection.slice(0, 2).map((stat, index) => (
            <div key={stat.section} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${
                  index === 0 
                    ? 'bg-purple-100 dark:bg-purple-900' 
                    : 'bg-yellow-100 dark:bg-yellow-900'
                }`}>
                  <svg className={`w-6 h-6 ${
                    index === 0 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.section}
                  </p>
                  <p className={`text-2xl font-bold ${
                    index === 0 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {stat.count}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Sélecteur de section */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrer par section
            </label>
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

          {/* Barre de recherche */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rechercher une offre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Rechercher par titre ou description..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des offres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Offres de formation
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredOffres.length} offre(s) trouvée(s)
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredOffres.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">📚</div>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedSectionId === "all" 
                  ? "Aucune offre de formation trouvée" 
                  : "Aucune offre dans cette section"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOffres.map((item, index) => (
                <div
                  key={`${item.sectionId}-${item.index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {item.offre.icon.startsWith('http') ? (
                          <img
                            src={item.offre.icon}
                            alt={item.offre.titre}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg text-2xl">
                            {item.offre.icon === 'AcademicCapIcon' && '🎓'}
                            {item.offre.icon === 'BookOpenIcon' && '📖'}
                            {item.offre.icon === 'ComputerDesktopIcon' && '💻'}
                            {item.offre.icon === 'CogIcon' && '⚙️'}
                            {item.offre.icon === 'BeakerIcon' && '🧪'}
                            {item.offre.icon === 'CalculatorIcon' && '🧮'}
                            {item.offre.icon === 'ChartBarIcon' && '📊'}
                            {item.offre.icon === 'CurrencyDollarIcon' && '💰'}
                            {item.offre.icon === 'GlobeAltIcon' && '🌐'}
                            {item.offre.icon === 'HeartIcon' && '❤️'}
                            {item.offre.icon === 'HomeIcon' && '🏠'}
                            {item.offre.icon === 'LightBulbIcon' && '💡'}
                            {item.offre.icon === 'MegaphoneIcon' && '📢'}
                            {item.offre.icon === 'MusicalNoteIcon' && '🎵'}
                            {item.offre.icon === 'PaintBrushIcon' && '🎨'}
                            {item.offre.icon === 'ScaleIcon' && '⚖️'}
                            {item.offre.icon === 'ShieldCheckIcon' && '🛡️'}
                            {item.offre.icon === 'TruckIcon' && '🚛'}
                            {item.offre.icon === 'UserGroupIcon' && '👥'}
                            {item.offre.icon === 'WrenchScrewdriverIcon' && '🔧'}
                            {!item.offre.icon.startsWith('http') && !['AcademicCapIcon', 'BookOpenIcon', 'ComputerDesktopIcon', 'CogIcon', 'BeakerIcon', 'CalculatorIcon', 'ChartBarIcon', 'CurrencyDollarIcon', 'GlobeAltIcon', 'HeartIcon', 'HomeIcon', 'LightBulbIcon', 'MegaphoneIcon', 'MusicalNoteIcon', 'PaintBrushIcon', 'ScaleIcon', 'ShieldCheckIcon', 'TruckIcon', 'UserGroupIcon', 'WrenchScrewdriverIcon'].includes(item.offre.icon) && '📚'}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                            {item.offre.titre}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {item.sectionName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.offre.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
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
      <OffreModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Créer une nouvelle offre"
      />

      <OffreModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOffre(null);
        }}
        onSubmit={handleEdit}
        offre={selectedOffre?.offre}
        title="Modifier l'offre"
      />
    </div>
  );
}
