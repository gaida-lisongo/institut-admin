"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Offre } from "@/stores/sectionStore";
import BlobManager from "@/services/BlobManager";

// Icônes disponibles
const availableIcons = [
  { name: "AcademicCapIcon", label: "Diplôme", icon: "🎓" },
  { name: "BookOpenIcon", label: "Livre", icon: "📖" },
  { name: "ComputerDesktopIcon", label: "Ordinateur", icon: "💻" },
  { name: "CogIcon", label: "Engrenage", icon: "⚙️" },
  { name: "BeakerIcon", label: "Laboratoire", icon: "🧪" },
  { name: "CalculatorIcon", label: "Calculatrice", icon: "🧮" },
  { name: "ChartBarIcon", label: "Graphique", icon: "📊" },
  { name: "CurrencyDollarIcon", label: "Finances", icon: "💰" },
  { name: "GlobeAltIcon", label: "Globe", icon: "🌐" },
  { name: "HeartIcon", label: "Santé", icon: "❤️" },
  { name: "HomeIcon", label: "Maison", icon: "🏠" },
  { name: "LightBulbIcon", label: "Idée", icon: "💡" },
  { name: "MegaphoneIcon", label: "Communication", icon: "📢" },
  { name: "MusicalNoteIcon", label: "Musique", icon: "🎵" },
  { name: "PaintBrushIcon", label: "Art", icon: "🎨" },
  { name: "ScaleIcon", label: "Justice", icon: "⚖️" },
  { name: "ShieldCheckIcon", label: "Sécurité", icon: "🛡️" },
  { name: "TruckIcon", label: "Transport", icon: "🚛" },
  { name: "UserGroupIcon", label: "Groupe", icon: "👥" },
  { name: "WrenchScrewdriverIcon", label: "Outils", icon: "🔧" },
];

interface OffreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offre: Offre) => Promise<void>;
  offre?: Offre | null;
  title: string;
}

export default function OffreModal({
  isOpen,
  onClose,
  onSubmit,
  offre,
  title,
}: OffreModalProps) {
  const [formData, setFormData] = useState<Offre>({
    icon: "",
    titre: "",
    description: "",
  });

  const [iconType, setIconType] = useState<'predefined' | 'custom'>('predefined');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (offre) {
      setFormData(offre);
      // Déterminer si l'icône est prédéfinie ou personnalisée
      const isPredefined = availableIcons.some(icon => icon.name === offre.icon);
      setIconType(isPredefined ? 'predefined' : 'custom');
    } else {
      setFormData({
        icon: "",
        titre: "",
        description: "",
      });
      setIconType('predefined');
    }
  }, [offre, isOpen]);

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
      setFormData(prev => ({ ...prev, icon: result.url }));
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleIconSelect = (iconName: string) => {
    setFormData(prev => ({ ...prev, icon: iconName }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de l'offre *
            </label>
            <input
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
              placeholder="Ex: Informatique de Gestion"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
              placeholder="Décrivez cette offre de formation..."
            />
          </div>

          {/* Type d'icône */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Icône
            </label>
            
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setIconType('predefined')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  iconType === 'predefined'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                Icône prédéfinie
              </button>
              
              <button
                type="button"
                onClick={() => setIconType('custom')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  iconType === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                Image personnalisée
              </button>
            </div>

            {iconType === 'predefined' ? (
              <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                {availableIcons.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => handleIconSelect(icon.name)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.icon === icon.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    title={icon.label}
                  >
                    <div className="text-2xl mb-1">{icon.icon}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{icon.label}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {formData.icon && iconType === 'custom' && (
                  <div className="flex items-center space-x-3">
                    <img
                      src={formData.icon}
                      alt="Icône personnalisée"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Image sélectionnée
                    </div>
                  </div>
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
                    {uploading ? "Upload en cours..." : "Choisir une image"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Aperçu */}
          {formData.icon && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aperçu de l'offre
              </h3>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {iconType === 'predefined' ? (
                    <div className="w-12 h-12 flex items-center justify-center text-2xl">
                      {availableIcons.find(i => i.name === formData.icon)?.icon}
                    </div>
                  ) : (
                    <img
                      src={formData.icon}
                      alt="Icône"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {formData.titre || "Titre de l'offre"}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formData.description || "Description de l'offre"}
                  </p>
                </div>
              </div>
            </div>
          )}

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
              disabled={!formData.titre || !formData.description || !formData.icon}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {offre ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
