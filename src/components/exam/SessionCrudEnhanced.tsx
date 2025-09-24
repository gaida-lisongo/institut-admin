"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { useProduitStore } from "@/stores/produitStore";
import { useCoursStore } from "@/stores/coursStore";
import { useSectionStore } from "@/stores/sectionStore";
import BlobManager from "@/services/BlobManager";

// Composant pour les champs multiples avec support des retours à la ligne
const MultiFieldInput = ({ 
  label, 
  values, 
  onChange, 
  placeholder, 
  icon,
  colorClass = "blue",
  minFields = 1 
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  icon?: string;
  colorClass?: string;
  minFields?: number;
}) => {
  const addField = () => {
    onChange([...values, ""]);
  };

  const updateField = (index: number, value: string) => {
    const newValues = values.map((item, i) => i === index ? value : item);
    onChange(newValues);
  };

  const removeField = (index: number) => {
    if (values.length > minFields) {
      onChange(values.filter((_, i) => i !== index));
    }
  };

  const colorClasses = {
    blue: "border-blue-200 focus:border-blue-500 focus:ring-blue-500",
    green: "border-green-200 focus:border-green-500 focus:ring-green-500",
    orange: "border-orange-200 focus:border-orange-500 focus:ring-orange-500",
    purple: "border-purple-200 focus:border-purple-500 focus:ring-purple-500"
  };

  const buttonColorClasses = {
    blue: "text-blue-600 hover:text-blue-800 hover:bg-blue-50",
    green: "text-green-600 hover:text-green-800 hover:bg-green-50",
    orange: "text-orange-600 hover:text-orange-800 hover:bg-orange-50",
    purple: "text-purple-600 hover:text-purple-800 hover:bg-purple-50"
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <label className={`block text-sm font-semibold text-${colorClass}-700 dark:text-${colorClass}-300`}>
          {label} ({values.filter(v => v.trim()).length})
        </label>
      </div>
      
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="relative group">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm transition-all duration-200 
                    ${colorClasses[colorClass as keyof typeof colorClasses]} 
                    resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50
                    placeholder-gray-400 dark:bg-gray-800 dark:text-white
                    shadow-sm hover:shadow-md focus:shadow-lg`}
                  rows={3}
                  value={value}
                  onChange={(e) => updateField(index, e.target.value)}
                  placeholder={`${placeholder} ${index + 1}`}
                  style={{ minHeight: '80px' }}
                />
                <div className="absolute top-2 right-2 text-xs text-gray-400">
                  {value.length} caractères
                </div>
              </div>
              
              {values.length > minFields && (
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                    transition-colors duration-200 shadow-sm hover:shadow-md
                    flex items-center justify-center h-fit mt-1"
                  title="Supprimer ce champ"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addField}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          ${buttonColorClasses[colorClass as keyof typeof buttonColorClasses]}
          border-2 border-dashed border-current transition-all duration-200
          hover:border-solid hover:shadow-md`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Ajouter {label.toLowerCase()}
      </button>
    </div>
  );
};

// Modal de création de session améliorée
const ModalCreateSessionEnhanced = ({ open, onClose, onSubmit, coursDisponibles, loading }: any) => {
  const [coursSelectionnes, setCoursSelectionnes] = useState<string[]>([]);
  const [nomSession, setNomSession] = useState<string>("");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coursSelectionnes.length === 0 || !nomSession.trim() || !dateDebut || !dateFin) return;
    
    if (new Date(dateFin) <= new Date(dateDebut)) {
      alert("La date de fin doit être postérieure à la date de début");
      return;
    }

    onSubmit({
      nomSession: nomSession.trim(),
      cours: coursSelectionnes,
      dateDebut,
      dateFin
    });
    setCoursSelectionnes([]);
    setNomSession("");
    setDateDebut("");
    setDateFin("");
  };

  const toggleCours = (coursId: string) => {
    setCoursSelectionnes(prev => 
      prev.includes(coursId) 
        ? prev.filter(id => id !== coursId)
        : [...prev, coursId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto
        border border-gray-200 dark:border-gray-700 transform transition-all duration-300">
        
        {/* Header décoratif */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 
            rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Créer une session d'examen
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Configurez une nouvelle session d'examen avec ses paramètres
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
            rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-blue-500">📋</span>
              Informations générales
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nom de la session
                </label>
                <input
                  type="text"
                  value={nomSession}
                  onChange={e => setNomSession(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 
                    focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200
                    dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg"
                  placeholder="Ex: Session d'examen Janvier 2024"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date de début
                </label>
                <input
                  type="datetime-local"
                  value={dateDebut}
                  onChange={e => setDateDebut(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 
                    focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200
                    dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date de fin
                </label>
                <input
                  type="datetime-local"
                  value={dateFin}
                  onChange={e => setDateFin(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:border-red-500 
                    focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200
                    dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Sélection des cours */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 
            rounded-xl p-6 border border-green-200 dark:border-green-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-green-500">📚</span>
              Cours pour cette session ({coursSelectionnes.length} sélectionné{coursSelectionnes.length > 1 ? 's' : ''})
            </h3>
            
            <div className="max-h-64 overflow-y-auto border-2 border-dashed border-green-300 rounded-xl p-4 
              bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              {coursDisponibles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📖</div>
                  <p className="text-gray-500 text-lg font-medium">Aucun cours disponible</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Vous pourrez associer des produits après la création de la session
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {coursDisponibles.map((cours: any) => (
                    <label key={cours._id} 
                      className="flex items-center space-x-3 p-4 hover:bg-white/80 dark:hover:bg-gray-700/80 
                        rounded-xl cursor-pointer transition-all duration-200 border border-transparent
                        hover:border-green-300 hover:shadow-md group">
                      <input
                        type="checkbox"
                        checked={coursSelectionnes.includes(cours._id)}
                        onChange={() => toggleCours(cours._id)}
                        className="w-5 h-5 rounded border-2 border-green-300 text-green-600 
                          focus:ring-green-500 focus:ring-2 transition-all duration-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-green-600 
                          transition-colors duration-200 truncate">
                          {cours.titre}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {cours.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span>💡</span>
                Vous pourrez associer des produits d'enrollment à cette session après sa création
              </p>
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl 
                font-medium transition-all duration-200 shadow-sm hover:shadow-md
                border border-gray-300 hover:border-gray-400"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading || !nomSession.trim() || coursSelectionnes.length === 0 || !dateDebut || !dateFin}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl
                flex items-center gap-2 ${
                nomSession.trim() && coursSelectionnes.length > 0 && dateDebut && dateFin
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Création...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer la session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreateSessionEnhanced;
