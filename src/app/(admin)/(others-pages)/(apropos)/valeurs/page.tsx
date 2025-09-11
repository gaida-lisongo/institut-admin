"use client";
import React, { useEffect, useState } from "react";
import { useSectionStore, type Section } from "@/stores/sectionStore";
import { PlusIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function ValeursPage() {
  const {
    sections,
    isLoading,
    fetchSections,
    updateValeursInSection,
  } = useSectionStore();

  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempValeurs, setTempValeurs] = useState<string[]>([]);
  const [newValeur, setNewValeur] = useState("");

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleEditSection = (sectionId: string, valeurs: string[]) => {
    setEditingSection(sectionId);
    setTempValeurs([...valeurs]);
  };

  const handleSaveValeurs = async (sectionId: string) => {
    const success = await updateValeursInSection(sectionId, tempValeurs);
    if (success) {
      setEditingSection(null);
      setTempValeurs([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setTempValeurs([]);
    setNewValeur("");
  };

  const handleAddValeur = () => {
    if (newValeur.trim()) {
      setTempValeurs([...tempValeurs, newValeur.trim()]);
      setNewValeur("");
    }
  };

  const handleRemoveValeur = (index: number) => {
    setTempValeurs(tempValeurs.filter((_, i) => i !== index));
  };

  const handleUpdateValeur = (index: number, value: string) => {
    const updated = [...tempValeurs];
    updated[index] = value;
    setTempValeurs(updated);
  };

  // Filtrer les sections par terme de recherche
  const filteredSections = sections
    .filter(section => selectedSectionId === "all" || section._id === selectedSectionId)
    .filter(section => 
      section.description.sigle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.valeurs.some(valeur => valeur.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  // Statistiques
  const totalValeurs = sections.reduce((acc, section) => acc + section.valeurs.length, 0);
  const valeursParSection = sections.map(section => ({
    section: section.description.sigle,
    count: section.valeurs.length
  }));

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des valeurs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les valeurs par section
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
              placeholder="Rechercher dans les valeurs..."
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
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total valeurs
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalValeurs}
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
                  Sections filtrées
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {filteredSections.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Moyenne par section
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {sections.length > 0 ? Math.round(totalValeurs / sections.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des sections et leurs valeurs */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">💎</div>
            <p className="text-gray-500 dark:text-gray-400">
              {selectedSectionId === "all" 
                ? "Aucune section trouvée" 
                : "Aucune section correspondante"}
            </p>
          </div>
        ) : (
          filteredSections.map((section) => (
            <div key={section._id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {section.description.sigle} - {section.description.designation}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {section.valeurs.length} valeur(s)
                    </p>
                  </div>
                  
                  {editingSection === section._id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveValeurs(section._id!)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditSection(section._id!, section.valeurs)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Modifier
                    </button>
                  )}
                </div>

                {editingSection === section._id ? (
                  <div className="space-y-4">
                    {/* Formulaire d'ajout de nouvelle valeur */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newValeur}
                        onChange={(e) => setNewValeur(e.target.value)}
                        placeholder="Nouvelle valeur..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddValeur()}
                      />
                      <button
                        onClick={handleAddValeur}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Liste des valeurs éditables */}
                    <div className="space-y-2">
                      {tempValeurs.map((valeur, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={valeur}
                            onChange={(e) => handleUpdateValeur(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            onClick={() => handleRemoveValeur(index)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {section.valeurs.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        Aucune valeur définie
                      </p>
                    ) : (
                      section.valeurs.map((valeur, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        >
                          {valeur}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
