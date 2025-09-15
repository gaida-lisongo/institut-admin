"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Cycle, CycleFormData, Classe } from "@/services/CycleService";
import { useCycleStore } from "@/stores/cycleStore";

interface CycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle?: Cycle | null;
  sectionId: string;
}

export default function CycleModal({ isOpen, onClose, cycle, sectionId }: CycleModalProps) {
  const { createCycle, updateCycle, loading } = useCycleStore();
  
  const [formData, setFormData] = useState<CycleFormData>({
    designation: "",
    description: "",
    systeme: "",
    sectionId: sectionId,
    classes: []
  });

  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (cycle) {
      setFormData({
        designation: cycle.designation,
        description: cycle.description,
        systeme: cycle.systeme,
        sectionId: cycle.sectionId,
        classes: cycle.classes.map(classe => ({
          designation: classe.designation,
          description: classe.description,
          semestres: classe.semestres
        }))
      });
    } else {
      setFormData({
        designation: "",
        description: "",
        systeme: "",
        sectionId: sectionId,
        classes: []
      });
    }
  }, [cycle, sectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (cycle?._id) {
        await updateCycle(cycle._id, formData);
      } else {
        await createCycle(formData);
      }
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur s'est produite");
    }
  };

  const addClasse = () => {
    setFormData(prev => ({
      ...prev,
      classes: [...prev.classes, { designation: "", description: "", semestres: [] }]
    }));
  };

  const removeClasse = (index: number) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== index)
    }));
  };

  const updateClasse = (index: number, field: keyof Classe, value: string) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.map((classe, i) => 
        i === index ? { ...classe, [field]: value } : classe
      )
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl w-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {cycle ? "Modifier le cycle" : "Créer un nouveau cycle"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Désignation *
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Système *
              </label>
              <select
                value={formData.systeme}
                onChange={(e) => setFormData(prev => ({ ...prev, systeme: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Sélectionner un système</option>
                <option value="LMD">LMD</option>
                <option value="Classique">Classique</option>
                <option value="Professionnel">Professionnel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Classes */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Classes
              </label>
              <button
                type="button"
                onClick={addClasse}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Ajouter une classe
              </button>
            </div>

            <div className="space-y-3">
              {formData.classes.map((classe, index) => (
                <div key={index} className="p-3 border border-gray-200 dark:border-gray-600 rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Classe {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeClasse(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Désignation
                      </label>
                      <input
                        type="text"
                        value={classe.designation}
                        onChange={(e) => updateClasse(index, 'designation', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={classe.description}
                        onChange={(e) => updateClasse(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : cycle ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}