import React, { useState, useRef } from "react";
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

// Modal pour associer un produit améliorée
const ModalAssociateProduitEnhanced = ({ 
  open, onClose, onSubmit, sessionId, sessionName, sectionId, anneeId, loading 
}: any) => {
  const [designation, setDesignation] = useState("");
  const [montant, setMontant] = useState(0);
  const [caracteristiques, setCaracteristiques] = useState<string[]>([""]);
  const [avantages, setAvantages] = useState<string[]>([""]);
  const [benefice, setBenefice] = useState<string[]>([""]);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const file = e.target.files[0];
      const res = await BlobManager.createBlob(file);
      setImage(res.url || res.path || "");
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        sessionId,
        produitData: {
          designation,
          montant,
          categorie: ["session"],
          caracteristiques: caracteristiques.filter(c => c.trim() !== ""),
          avantages: avantages.filter(a => a.trim() !== ""),
          benefice: benefice.filter(b => b.trim() !== ""),
          sectionId,
          anneeId,
          image
        }
      });
      // Reset form
      setDesignation("");
      setMontant(0);
      setCaracteristiques([""]);
      setAvantages([""]);
      setBenefice([""]);
      setImage("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'association du produit");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-6xl max-h-[90vh] 
        overflow-y-auto border border-gray-200 dark:border-gray-700 transform transition-all duration-300 relative">
        
        <button 
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
            text-3xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 
            rounded-full w-10 h-10 flex items-center justify-center z-10" 
          onClick={onClose}
        >
          &times;
        </button>
        
        {/* Header décoratif */}
        <div className="text-center mb-8 pr-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 
            rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Créer et associer un produit
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Pour la session "{sessionName}"
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="text-red-500 text-xl">⚠️</div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
            rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-blue-500">ℹ️</span>
              Informations de base
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Désignation du produit
                </label>
                <input 
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 
                    focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200
                    dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg" 
                  value={designation} 
                  onChange={e => setDesignation(e.target.value)} 
                  placeholder="Ex: Examen Session L1 HE"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Montant (FC)
                </label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 
                    focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200
                    dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg" 
                  value={montant} 
                  onChange={e => setMontant(Number(e.target.value))} 
                  min="0"
                  required 
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Catégorie
              </label>
              <div className="flex items-center gap-3">
                <input 
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 
                    dark:bg-gray-800 dark:text-white" 
                  value="session" 
                  disabled 
                />
                <div className="text-2xl">🏷️</div>
              </div>
            </div>
            
            {/* Upload d'image */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Image du produit
              </label>
              <div className="space-y-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleUpload} 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                    rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200
                    shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2" 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Chargement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Charger une image
                    </>
                  )}
                </button>
                {image && (
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <img src={image} alt="aperçu" className="w-full h-48 object-cover" />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      ✓ Image chargée
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Caractéristiques */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
              rounded-xl p-6 border border-blue-200 dark:border-blue-700">
              <MultiFieldInput
                label="Caractéristiques"
                values={caracteristiques}
                onChange={setCaracteristiques}
                placeholder="Décrivez une caractéristique"
                icon="🔍"
                colorClass="blue"
              />
            </div>

            {/* Avantages */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 
              rounded-xl p-6 border border-green-200 dark:border-green-700">
              <MultiFieldInput
                label="Avantages"
                values={avantages}
                onChange={setAvantages}
                placeholder="Décrivez un avantage"
                icon="✅"
                colorClass="green"
              />
            </div>

            {/* Bénéfices */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 
              rounded-xl p-6 border border-orange-200 dark:border-orange-700">
              <MultiFieldInput
                label="Bénéfices"
                values={benefice}
                onChange={setBenefice}
                placeholder="Décrivez un bénéfice"
                icon="🎯"
                colorClass="orange"
              />
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
              disabled={loading || !designation.trim() || montant <= 0}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl
                flex items-center gap-2 ${
                designation.trim() && montant > 0
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 transform hover:scale-105' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Association...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer et associer le produit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAssociateProduitEnhanced;
