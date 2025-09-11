"use client";
import React, { useState, useEffect } from "react";
import { type Team } from "@/stores/sectionStore";
import blobManager from "@/services/BlobManager";

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamMember: Team) => void;
  teamMember?: Team;
  title: string;
}

export default function TeamModal({
  isOpen,
  onClose,
  onSubmit,
  teamMember,
  title,
}: TeamModalProps) {
  const [formData, setFormData] = useState<Team>({
    nom: "",
    grade: "",
    fonction: "",
    photo: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (teamMember) {
      setFormData(teamMember);
      setImagePreview(teamMember.photo || "");
    } else {
      setFormData({
        nom: "",
        grade: "",
        fonction: "",
        photo: "",
      });
      setImagePreview("");
    }
    setImageFile(null);
  }, [teamMember, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim() || !formData.grade.trim() || !formData.fonction.trim()) {
      alert("Le nom, le grade et la fonction sont obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      let photoUrl = formData.photo;

      if (imageFile) {
        const result = await blobManager.createBlob(imageFile, { type: "team" });
        photoUrl = result.url;
      }

      const memberData: Team = {
        ...formData,
        photo: photoUrl,
      };

      onSubmit(memberData);
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grade *
            </label>
            <input
              type="text"
              value={formData.grade}
              onChange={(e) =>
                setFormData({ ...formData, grade: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Professeur, Dr, Ing, etc."
              required
            />
          </div>

          {/* Fonction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fonction *
            </label>
            <input
              type="text"
              value={formData.fonction}
              onChange={(e) =>
                setFormData({ ...formData, fonction: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Chef de section, Directeur des études, etc."
              required
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="w-20 h-20 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Formats supportés: JPG, PNG, GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>



          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? "Traitement..." : teamMember ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
