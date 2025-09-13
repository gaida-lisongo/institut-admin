"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Agent, AgentFormData } from "@/types/agent";
import BlobManager from "@/services/BlobManager";
import { PasswordUtils } from "@/utils/passwordUtils";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AgentFormData) => Promise<void>;
  agent?: Agent | null;
  title: string;
}

export default function AgentModal({
  isOpen,
  onClose,
  onSubmit,
  agent,
  title,
}: AgentModalProps) {
  const [formData, setFormData] = useState<AgentFormData>({
    nom: "",
    post_nom: "",
    prenom: "",
    sexe: "",
    nationalite: "",
    lieu_naissance: "",
    date_naissance: "",
    matricule: "",
    secure: "",
    solde: 0,
    grade: "",
    titre: "",
    photo: "",
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (agent) {
      setFormData({
        nom: agent.nom,
        post_nom: agent.post_nom,
        prenom: agent.prenom,
        sexe: agent.sexe,
        nationalite: agent.nationalite,
        lieu_naissance: agent.lieu_naissance,
        date_naissance: agent.date_naissance instanceof Date 
          ? agent.date_naissance.toISOString().split('T')[0]
          : agent.date_naissance ? agent.date_naissance.split('T')[0] : "",
        matricule: agent.matricule,
        secure: agent.secure,
        solde: agent.solde,
        grade: agent.grade,
        titre: agent.titre,
        photo: agent.photo || "",
      });
    } else {
      setFormData({
        nom: "",
        post_nom: "",
        prenom: "",
        sexe: "",
        nationalite: "",
        lieu_naissance: "",
        date_naissance: "",
        matricule: "",
        secure: "",
        solde: 0,
        grade: "",
        titre: "",
        photo: "",
      });
    }
  }, [agent, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await BlobManager.createBlob(file);
      setFormData(prev => ({ ...prev, photo: result.url }));
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const generateMatricule = () => {
    const prefix = "MAT";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const generatePassword = () => {
    return PasswordUtils.generateSecurePassword(12);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Photo */}
        <div className="flex items-center space-x-4">
          {formData.photo && (
            <img
              src={formData.photo}
              alt="Photo agent"
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              {uploading ? "Upload..." : "Choisir une photo"}
            </button>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Post-nom *
            </label>
            <input
              type="text"
              value={formData.post_nom}
              onChange={(e) => setFormData(prev => ({ ...prev, post_nom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prénom *
            </label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sexe *
            </label>
            <select
              value={formData.sexe}
              onChange={(e) => setFormData(prev => ({ ...prev, sexe: e.target.value as 'M' | 'F' }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Sélectionner</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nationalité
            </label>
            <input
              type="text"
              value={formData.nationalite}
              onChange={(e) => setFormData(prev => ({ ...prev, nationalite: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lieu de naissance
            </label>
            <input
              type="text"
              value={formData.lieu_naissance}
              onChange={(e) => setFormData(prev => ({ ...prev, lieu_naissance: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date de naissance
            </label>
            <input
              type="date"
              value={formData.date_naissance}
              onChange={(e) => setFormData(prev => ({ ...prev, date_naissance: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <select
              value={formData.titre}
              onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionner</option>
              <option value="D6">Diplômé</option>
              <option value="Gr">Gradué</option>
              <option value="Lc">Licencié</option>
              <option value="Mt">Maitrise</option>
              <option value="Dr">Doctorat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Grade
            </label>
            <input
              type="text"
              value={formData.grade}
              onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: CPP, ASS, P, PO,, ATA1 etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Solde (CDF)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.solde}
              onChange={(e) => setFormData(prev => ({ ...prev, solde: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Informations système */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Informations système
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Matricule *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.matricule}
                  onChange={(e) => setFormData(prev => ({ ...prev, matricule: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, matricule: generateMatricule() }))}
                  className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 text-sm"
                >
                  Générer
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mot de passe *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.secure}
                  onChange={(e) => setFormData(prev => ({ ...prev, secure: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, secure: generatePassword() }))}
                  className="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 text-sm"
                >
                  Générer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {agent ? "Modifier" : "Créer"}
          </button>
        </div>
        </form>
      </div>
    </Modal>
  );
}
