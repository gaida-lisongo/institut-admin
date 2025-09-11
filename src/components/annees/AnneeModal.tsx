"use client";
import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import TiptapEditor from "@/components/common/TiptapEditor";
import BlobManager from "@/services/BlobManager";
import { Annee } from "@/services/AnneeService";

interface AnneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Annee>) => Promise<void>;
  annee?: Annee | null;
  isLoading?: boolean;
}

export default function AnneeModal({
  isOpen,
  onClose,
  onSave,
  annee = null,
  isLoading = false,
}: AnneeModalProps) {
  const [formData, setFormData] = useState({
    debut: annee?.debut || new Date().getFullYear(),
    fin: annee?.fin || new Date().getFullYear() + 1,
    motDg: {
      photo: annee?.motDg?.photo || "",
      description: annee?.motDg?.description || "",
    },
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobManager = BlobManager;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMotDgChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      motDg: {
        ...prev.motDg,
        [field]: value,
      },
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await blobManager.createBlob(file, {
        type: "annee-photo-dg",
        anneeId: annee?._id,
      });
      
      handleMotDgChange("photo", result.url);
    } catch (error) {
      console.error("Erreur upload photo:", error);
      alert("Erreur lors de l'upload de la photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.debut >= formData.fin) {
      alert("L'année de fin doit être supérieure à l'année de début");
      return;
    }

    try {
      await onSave(formData);
      onClose();
      // Reset form
      setFormData({
        debut: new Date().getFullYear(),
        fin: new Date().getFullYear() + 1,
        motDg: { photo: "", description: "" },
      });
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6">
      <h4 className="font-semibold text-gray-800 mb-6 text-title-sm dark:text-white/90">
        {annee ? "Modifier l'année académique" : "Créer une nouvelle année académique"}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Années début et fin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Année de début
            </label>
            <input
              type="number"
              value={formData.debut}
              onChange={(e) => handleInputChange("debut", parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Année de fin
            </label>
            <input
              type="number"
              value={formData.fin}
              onChange={(e) => handleInputChange("fin", parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Photo du DG */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Photo du Directeur Général
          </label>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Upload..." : "Choisir une photo"}
            </button>
            {formData.motDg.photo && (
              <div className="flex items-center gap-2">
                <img
                  src={formData.motDg.photo}
                  alt="Photo DG"
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <span className="text-sm text-green-600">Photo uploadée</span>
              </div>
            )}
          </div>
        </div>

        {/* Mot du DG (WYSIWYG) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mot du Directeur Général
          </label>
          <TiptapEditor
            content={formData.motDg.description}
            onChange={(content: string) => handleMotDgChange("description", content)}
            placeholder="Rédigez le mot du Directeur Général..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button disabled={isLoading || uploading}>
            {isLoading ? "Sauvegarde..." : annee ? "Modifier" : "Créer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
