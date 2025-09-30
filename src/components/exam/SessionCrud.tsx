"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { useProduitStore } from "@/stores/produitStore";
import { useCoursStore } from "@/stores/coursStore";
import { useSectionStore } from "@/stores/sectionStore";
import BlobManager from "@/services/BlobManager";

// Modal de création de session
const ModalCreateSession = ({ open, onClose, onSubmit, coursDisponibles, loading }: any) => {
  const [coursSelectionnes, setCoursSelectionnes] = useState<string[]>([]);
  const [nomSession, setNomSession] = useState<string>("");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coursSelectionnes.length === 0 || !nomSession.trim() || !dateDebut || !dateFin) return;
    
    // Vérifier que la date de fin est après la date de début
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Créer une session d'examen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom de la session</label>
            <input
              type="text"
              value={nomSession}
              onChange={e => setNomSession(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Session d'examen Janvier 2024"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-2">Date de début</label>
              <input
                type="datetime-local"
                value={dateDebut}
                onChange={e => setDateDebut(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date de fin</label>
              <input
                type="datetime-local"
                value={dateFin}
                onChange={e => setDateFin(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Cours pour cette session ({coursSelectionnes.length} sélectionné{coursSelectionnes.length > 1 ? 's' : ''})
          </label>
          <div className="max-h-48 overflow-y-auto border rounded p-3 bg-gray-50 dark:bg-gray-700">
            {coursDisponibles.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">Aucun cours disponible</p>
                <p className="text-xs text-gray-400 mt-1">Vous pourrez associer des produits après la création de la session</p>
              </div>
            ) : (
              coursDisponibles.map((cours: any) => (
                <label key={cours._id} className="flex items-center space-x-2 mb-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coursSelectionnes.includes(cours._id)}
                    onChange={() => toggleCours(cours._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{cours.titre}</div>
                    <div className="text-xs text-gray-500">{cours.description}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Vous pourrez associer des produits d'enrollement à cette session après sa création
          </p>
        </div>
        
        <div className="flex gap-2 justify-end">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={loading || !nomSession.trim() || coursSelectionnes.length === 0 || !dateDebut || !dateFin}
            className={`px-4 py-2 rounded ${
              nomSession.trim() && coursSelectionnes.length > 0 && dateDebut && dateFin
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? "Création..." : "Créer la session"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Modal de confirmation de suppression
const ModalConfirmDelete = ({ open, onClose, onConfirm, loading }: any) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Voulez-vous vraiment supprimer cette session d'examen ?
        </p>
        <div className="flex gap-2 justify-end">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};

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

// Modal pour associer un produit à une session
const ModalAssociateProduit = ({ open, onClose, onSubmit, sessionId, sessionName, sectionId, anneeId, loading }: any) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" 
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
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne 1: Informations de base */}
            <div>
              <label className="block text-sm font-medium mb-2">Désignation</label>
              <input 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={designation} 
                onChange={e => setDesignation(e.target.value)} 
                placeholder="Ex: Examen Session L1 HE"
                required 
              />
              
              <label className="block text-sm font-medium mb-2 mt-4">Montant (FC)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={montant} 
                onChange={e => setMontant(Number(e.target.value))} 
                min="0"
                required 
              />
              
              <label className="block text-sm font-medium mb-2 mt-4">Catégorie</label>
              <input 
                className="w-full px-3 py-2 border rounded bg-gray-100" 
                value="session" 
                disabled 
              />
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Image</label>
                <div className="space-y-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleUpload} 
                    className="hidden" 
                  />
                  <button 
                    type="button" 
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={uploading}
                  >
                    {uploading ? 'Chargement...' : 'Charger une image'}
                  </button>
                  {image && (
                    <div className="relative">
                      <img src={image} alt="aperçu" className="w-full h-32 object-cover rounded border" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne 2: Caractéristiques */}
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

            {/* Colonne 3: Avantages */}
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mt-8">
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

export default function SessionCrud() {
  const params = useParams();
  const slug = params?.slug as string;
  const anneeId = (slug?.split("-")[0] || "") + "";
  const sectionId = (slug?.split("-")[1] || "") + "";

  const { sessions, fetchSessions, createSession, updateSession, deleteSession, loading, error } = useSessionStore();
  const { produits, fetchProduits, createProduit, updateProduit, deleteProduit } = useProduitStore();
  const { cours, fetchCours, loading: coursLoading } = useCoursStore();
  const { sections, fetchSections, isLoading: sectionLoading } = useSectionStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showManageProduitModal, setShowManageProduitModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedProduit, setSelectedProduit] = useState<any>(null);
  const [editProduitMode, setEditProduitMode] = useState(false);
  const [editProduitData, setEditProduitData] = useState<any>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  // Ouvre la modal de gestion du produit associé à la session
  const openManageProduitModal = (session: any) => {
    setSelectedSession(session);
    setSelectedProduit(session.produitId);
    setEditProduitMode(false);
    if (session.produitId) {
      setEditProduitData({
        designation: session.produitId.designation || '',
        montant: session.produitId.montant || 0,
        caracteristiques: session.produitId.caracteristiques || [],
        avantages: session.produitId.avantages || [],
        benefice: session.produitId.benefice || [],
        image: session.produitId.image || ''
      });
    } else {
      setEditProduitData(null);
    }
    setShowManageProduitModal(true);
  };

  useEffect(() => {
    fetchSessions(anneeId);
    fetchProduits();
    fetchCours(); // Charger tous les cours disponibles
    fetchSections(); // Charger les sections
  }, [anneeId, fetchSessions, fetchProduits, fetchCours, fetchSections]);


  // Les produits peuvent être associés après la création de la session
  const produitsEnrol = produits.filter(p => 
    p.categorie && 
    p.categorie[0] === "enrollement" && 
    String(p.sectionId) === sectionId && 
    String(p.anneeId) === anneeId
  );


  // Dissocier le produit d'une session
  const handleDissociateProduit = async (sessionId: string) => {
    try {
      await updateSession(sessionId, { produitId: undefined });
      await fetchSessions(anneeId);
      await fetchProduits();
    } catch (error) {
      console.error("Erreur lors de la dissociation du produit :", error);
    }
  };

  // Supprimer définitivement le produit et vider session.produitId
  const handleDeleteProduit = async (produitId: string, sessionId: string) => {
    try {
      // 1. Supprimer le produit
      await deleteProduit(produitId);
      // 2. Mettre à jour la session en vidant produitId
      await updateSession(sessionId, { produitId: undefined });
      // 3. Recharger les données
      await fetchSessions(anneeId);
      await fetchProduits();
      // 4. Fermer le modal
      setShowManageProduitModal(false);
      alert("Produit supprimé définitivement avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression du produit :", error);
      alert("Erreur lors de la suppression du produit : " + (error as any)?.message || "Erreur inconnue");
    }
  };

  // Vérifier si la section existe
  const currentSection = sections.find(s => s._id === sectionId);

  const filteredSessions = sessions.filter(session => {
    const searchTerm = search.toLowerCase();
    const sessionName = session.nomSession?.toLowerCase() || '';
    
    // Rechercher dans les titres des cours populés
    const coursMatch = session.cours?.some(coursObj => {
      return coursObj?.titre && coursObj.titre?.toLowerCase().includes(searchTerm) || false;
    }) || false;
    
    return sessionName.includes(searchTerm) || coursMatch;
  });

  const handleCreateSession = async (data: any) => {
    try {
      await createSession({ 
        anneeId, 
        cours: data.cours,
        nomSession: data.nomSession,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin
      });
      await fetchSessions(anneeId);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const handleDeleteSession = async () => {
    if (!deleteSessionId) return;
    try {
      await deleteSession(deleteSessionId);
      await fetchSessions(anneeId);
      setDeleteSessionId(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de la session: " + (error as any)?.message || "Erreur inconnue");
    }
  };

  const handleAssociateProduit = async (data: any) => {
    try {
      // 1. Créer le produit
      const newProduit = await createProduit(data.produitData);
      // 2. Associer le produit à la session
      await updateSession(data.sessionId, { produitId: newProduit._id });
      // 3. Recharger les données
      await fetchSessions(anneeId);
      await fetchProduits();
      setShowAssociateModal(false);
      setSelectedSession(null);
    } catch (error) {
      console.error("Erreur lors de l'association:", error);
      throw error;
    }
  };


  const openAssociateModal = (session: any) => {
    setSelectedSession(session);
    setShowAssociateModal(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sessions d'examen</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion des sessions d'examen pour l'année académique
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 lg:mt-0">
          <input
            type="text"
            placeholder="Rechercher par session ou cours..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm shadow font-medium"
            onClick={() => setShowCreateModal(true)}
          >
            Nouvelle session
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {filteredSessions.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Sessions trouvées
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {sessions.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total sessions
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {produitsEnrol.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Produits disponibles
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {cours.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Cours disponibles
          </div>
        </div>
      </div>

      {/* Messages d'information et d'erreur */}
      {!currentSection && !sectionLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Section non trouvée</strong> - La section avec l'ID "{sectionId}" n'existe pas.
              </p>
            </div>
          </div>
        </div>
      )}

      {cours.length === 0 && !coursLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700">
            <strong>Info</strong> - Aucun cours disponible. Vous pouvez créer une session et ajouter des cours plus tard.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {(coursLoading || sectionLoading) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700">
            Chargement des données{coursLoading ? ' des cours' : ''}{sectionLoading ? ' des sections' : ''}...
          </p>
        </div>
      )}

      {/* DataTable */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Session d'examen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-500">Chargement des sessions...</p>
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucune session trouvée
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const now = new Date();
                  const debut = new Date(session.dateDebut);
                  const fin = new Date(session.dateFin);
                  
                  let statut = '';
                  let statutColor = '';
                  
                  if (now < debut) {
                    statut = 'À venir';
                    statutColor = 'bg-blue-100 text-blue-800';
                  } else if (now >= debut && now <= fin) {
                    statut = 'En cours';
                    statutColor = 'bg-green-100 text-green-800';
                  } else {
                    statut = 'Terminée';
                    statutColor = 'bg-gray-100 text-gray-800';
                  }

                  return (
                    <tr key={session._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.nomSession}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {session.produitId ? (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">Produit associé</span>
                              <button
                                className="text-xs text-red-500 underline hover:text-red-700"
                                onClick={() => handleDissociateProduit(session._id)} 
                                title="Dissocier le produit de cette session"
                              >
                                Dissocier
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => openAssociateModal(session)}
                            >
                              + Associer produit
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {session.cours && session.cours.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {session.cours.map((coursObj, idx) => (
                                <li key={idx}>
                                  {coursObj?.titre || "Aucun titre"}
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({coursObj?.credit || "0"} crédit{coursObj?.credit > 1 ? 's' : ''})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">Aucun cours</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="font-medium">
                            Du {formatDate(session.dateDebut)}
                          </div>
                          <div className="text-gray-500">
                            Au {formatDate(session.dateFin)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statutColor}`}>
                          {statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openManageProduitModal(session)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Gérer produits
                          </button>
                          <button
                            onClick={() => setDeleteSessionId(session._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ModalCreateSession
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSession}
        coursDisponibles={cours}
        loading={loading}
      />

      <ModalAssociateProduit
        open={showAssociateModal}
        onClose={() => {
          setShowAssociateModal(false);
          setSelectedSession(null);
        }}
        onSubmit={handleAssociateProduit}
        sessionId={selectedSession?._id}
        sessionName={selectedSession?.nomSession}
        sectionId={sectionId}
        anneeId={anneeId}
        loading={loading}
      />

      {/* Modal de gestion du produit associé à la session */}
      {showManageProduitModal && selectedProduit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowManageProduitModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Gérer le produit associé</h2>
            {editProduitMode ? (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  try {
                    const updatedProduit = await updateProduit(selectedProduit._id, {
                      designation: editProduitData.designation,
                      montant: editProduitData.montant,
                      caracteristiques: editProduitData.caracteristiques?.filter((c: string) => c.trim() !== ""),
                      avantages: editProduitData.avantages?.filter((a: string) => a.trim() !== ""),
                      benefice: editProduitData.benefice?.filter((b: string) => b.trim() !== ""),
                      image: editProduitData.image
                    });
                    await fetchProduits();
                    await fetchSessions(anneeId);
                    setEditProduitMode(false);
                    // Mettre à jour selectedProduit avec les nouvelles données
                    setSelectedProduit(updatedProduit);
                    alert("Produit mis à jour avec succès !");
                  } catch (error) {
                    console.error("Erreur lors de la mise à jour du produit:", error);
                    alert("Erreur lors de la mise à jour du produit: " + (error as any)?.message || "Erreur inconnue");
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Désignation</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editProduitData?.designation || ''}
                      onChange={e => setEditProduitData((d: any) => ({...d, designation: e.target.value}))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Montant (FC)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editProduitData?.montant || 0}
                      onChange={e => setEditProduitData((d: any) => ({...d, montant: Number(e.target.value)}))}
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Caractéristiques */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
                    rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                    <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <span>🔍</span>
                      Caractéristiques
                    </label>
                    <textarea
                      className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 
                        focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                        dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg
                        resize-none"
                      value={editProduitData?.caracteristiques?.join('\n') || ''}
                      onChange={e => setEditProduitData((d: any) => ({...d, caracteristiques: e.target.value.split('\n').filter(c => c.trim() !== '')}))}
                      rows={4}
                      placeholder="Une caractéristique par ligne&#10;Exemple:&#10;- Examen écrit de 2h&#10;- Questions à choix multiples"
                      style={{ minHeight: '120px' }}
                    />
                  </div>
                  
                  {/* Avantages */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 
                    rounded-xl p-4 border border-green-200 dark:border-green-700">
                    <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                      <span>✅</span>
                      Avantages
                    </label>
                    <textarea
                      className="w-full border-2 border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500 transition-all duration-200
                        dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg
                        resize-none"
                      value={editProduitData?.avantages?.join('\n') || ''}
                      onChange={e => setEditProduitData((d: any) => ({...d, avantages: e.target.value.split('\n').filter(a => a.trim() !== '')}))}
                      rows={4}
                      placeholder="Un avantage par ligne&#10;Exemple:&#10;- Validation des acquis&#10;- Progression académique"
                      style={{ minHeight: '120px' }}
                    />
                  </div>
                  
                  {/* Bénéfices */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 
                    rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                    <label className="block text-sm font-semibold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
                      <span>🎯</span>
                      Bénéfices
                    </label>
                    <textarea
                      className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 
                        focus:ring-orange-500 focus:border-orange-500 transition-all duration-200
                        dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg
                        resize-none"
                      value={editProduitData?.benefice?.join('\n') || ''}
                      onChange={e => setEditProduitData((d: any) => ({...d, benefice: e.target.value.split('\n').filter(b => b.trim() !== '')}))}
                      rows={4}
                      placeholder="Un bénéfice par ligne&#10;Exemple:&#10;- Obtention du diplôme&#10;- Compétences certifiées"
                      style={{ minHeight: '120px' }}
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    onClick={() => setEditProduitMode(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Désignation</h3>
                    <div className="text-gray-900 dark:text-white text-base mb-2">{selectedProduit.designation}</div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Montant</h3>
                    <div className="text-gray-900 dark:text-white text-base mb-2">{selectedProduit.montant} FC</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Caractéristiques</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {selectedProduit.caracteristiques?.map((c: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>{c}
                        </li>
                      ))}
                      {(!selectedProduit.caracteristiques || selectedProduit.caracteristiques.length === 0) && (
                        <li className="text-gray-400 italic">Aucune caractéristique</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-green-600 mb-2">AVANTAGES</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {selectedProduit.avantages?.map((a: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>{a}
                        </li>
                      ))}
                      {(!selectedProduit.avantages || selectedProduit.avantages.length === 0) && (
                        <li className="text-gray-400 italic">Aucun avantage</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-orange-600 mb-2">BÉNÉFICES</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {selectedProduit.benefice?.map((b: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>{b}
                        </li>
                      ))}
                      {(!selectedProduit.benefice || selectedProduit.benefice.length === 0) && (
                        <li className="text-gray-400 italic">Aucun bénéfice</li>
                      )}
                    </ul>
                  </div>
                </div>
                {selectedProduit.image && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">IMAGE</h3>
                    <img
                      src={selectedProduit.image}
                      alt="Produit"
                      className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    onClick={() => setEditProduitMode(true)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    onClick={async () => {
                      if (window.confirm('Voulez-vous vraiment dissocier ce produit de la session ? Cette action ne supprimera pas le produit mais le retirera de cette session.')) {
                        try {
                          await updateSession(selectedSession._id, { produitId: undefined });
                          setShowManageProduitModal(false);
                          await fetchSessions(anneeId);
                          alert("Produit dissocié avec succès !");
                        } catch (error) {
                          alert("Erreur lors de la dissociation du produit");
                        }
                      }
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Dissocier
                  </button>
                  <button
                    className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
                    onClick={async () => {
                      if (window.confirm('⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement ce produit ? Cette action est irréversible et supprimera le produit de toutes les sessions où il est utilisé.')) {
                        await handleDeleteProduit(selectedProduit._id, selectedSession._id);
                      }
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Supprimer définitivement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <ModalConfirmDelete
        open={!!deleteSessionId}
        onClose={() => setDeleteSessionId(null)}
        onConfirm={handleDeleteSession}
        loading={loading}
      />
    </div>
  );
}
