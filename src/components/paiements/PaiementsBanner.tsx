"use client";

import { Etablissement } from "@/types/etablissement";
import { Frais } from "@/types/frais";
import { Annee } from "@/types/annee";
import { Building2, Calendar, CreditCard, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface PaiementsBannerProps {
  etablissement: Etablissement | null;
  allFrais: Frais[];
  allAnnees: Annee[];
  selectedFrais: Frais | null;
  selectedAnnee: Annee | null;
  onFraisChange: (frais: Frais | null) => void;
  onAnneeChange: (annee: Annee | null) => void;
  isLoading: boolean;
}

export const PaiementsBanner = ({
  etablissement,
  allFrais,
  allAnnees,
  selectedFrais,
  selectedAnnee,
  onFraisChange,
  onAnneeChange,
  isLoading
}: PaiementsBannerProps) => {
  
  const [showFraisDropdown, setShowFraisDropdown] = useState(false);
  const [showAnneeDropdown, setShowAnneeDropdown] = useState(false);
  const fraisDropdownRef = useRef<HTMLDivElement>(null);
  const anneeDropdownRef = useRef<HTMLDivElement>(null);

  const handleFraisChange = (frais: Frais | null) => {
    onFraisChange(frais);
    setShowFraisDropdown(false);
  };

  const handleAnneeChange = (annee: Annee | null) => {
    onAnneeChange(annee);
    setShowAnneeDropdown(false);
  };

  // Fermer les dropdowns quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fraisDropdownRef.current && !fraisDropdownRef.current.contains(event.target as Node)) {
        setShowFraisDropdown(false);
      }
      if (anneeDropdownRef.current && !anneeDropdownRef.current.contains(event.target as Node)) {
        setShowAnneeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full p-6 mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!etablissement) {
    return (
      <div className="w-full p-6 mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Établissement non trouvé</p>
        </div>
      </div>
    );
  }

  console.log("Current etablissement: ", etablissement);
  console.log("Current frais: ", selectedFrais);
  console.log("Current annee: ", selectedAnnee);

  return (
    <div className="w-full p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        
        {/* Logo et informations établissement */}
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white shadow-md">
            {etablissement.logo ? (
              <Image
                src={etablissement.logo}
                alt={`Logo ${etablissement.designation}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
          
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {etablissement.designation}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {etablissement.categorie} • {etablissement.sigle}
            </p>
          </div>
        </div>

        {/* Sélecteurs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto lg:ml-auto">
          
          {/* Sélecteur de frais académiques */}
          <div className="flex flex-col space-y-2 min-w-[250px]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Frais Académiques
            </label>
            <div className="relative" ref={fraisDropdownRef}>
              <button
                type="button"
                onClick={() => setShowFraisDropdown(!showFraisDropdown)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <span className="truncate">
                  {selectedFrais ? selectedFrais.designation : "Sélectionner un frais"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {showFraisDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  <button
                    type="button"
                    onClick={() => handleFraisChange(null)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                  >
                    Aucun frais sélectionné
                  </button>
                  {allFrais.map((frais) => (
                    <button
                      key={frais._id}
                      type="button"
                      onClick={() => handleFraisChange(frais)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">{frais.designation}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {frais.categorie} • {frais.montant.toLocaleString()} $
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sélecteur d'année académique */}
          <div className="flex flex-col space-y-2 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Année Académique
            </label>
            <div className="relative" ref={anneeDropdownRef}>
              <button
                type="button"
                onClick={() => setShowAnneeDropdown(!showAnneeDropdown)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <span className="truncate">
                  {selectedAnnee ? `${selectedAnnee.debut}-${selectedAnnee.fin}` : "Sélectionner une année"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {showAnneeDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  <button
                    type="button"
                    onClick={() => handleAnneeChange(null)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                  >
                    Aucune année sélectionnée
                  </button>
                  {allAnnees.map((annee) => (
                    <button
                      key={annee._id}
                      type="button"
                      onClick={() => handleAnneeChange(annee)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">{annee.debut}-{annee.fin}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {annee.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informations sélectionnées */}
      {(selectedFrais || selectedAnnee) && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <div className="flex flex-wrap gap-4 text-sm">
            {selectedFrais && (
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                <CreditCard className="w-3 h-3" />
                <span className="font-medium">{selectedFrais.designation}</span>
                <span>({selectedFrais.montant.toLocaleString()}) $</span>
              </div>
            )}
            {selectedAnnee && (
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">{selectedAnnee.debut}-{selectedAnnee.fin}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
