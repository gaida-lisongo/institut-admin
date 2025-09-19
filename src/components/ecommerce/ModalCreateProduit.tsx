import React, { useRef, useState } from "react";
import BlobManager from "@/services/BlobManager";
import type { ProduitFormData } from '@/services/ProduitService';

interface ModalCreateProduitProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: ProduitFormData) => Promise<void>;
  sectionId: string;
  anneeId: string;
}

export default function ModalCreateProduit({ open, onClose, onCreate, sectionId, anneeId }: ModalCreateProduitProps) {
  const [designation, setDesignation] = useState("");
  const [montant, setMontant] = useState(0);
  const [caracteristiques, setCaracteristiques] = useState<string[]>([""]);
  const [avantages, setAvantages] = useState<string[]>([""]);
  const [benefice, setBenefice] = useState<string[]>([""]);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setSuccess(null);
    try {
      await onCreate({
        designation,
        montant,
        categorie: ["semestre"],
        caracteristiques: caracteristiques.filter(c => c.trim() !== ""),
        avantages: avantages.filter(a => a.trim() !== ""),
        benefice: benefice.filter(b => b.trim() !== ""),
        sectionId,
        anneeId,
        image
      });
      setSuccess("Produit créé avec succès !");
      setDesignation("");
      setMontant(0);
      setCaracteristiques([""]);
      setAvantages([""]);
      setBenefice([""]);
      setImage("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la création du produit");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-4xl relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-semibold mb-4">Créer et associer un produit</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium mb-1">Désignation</label>
              <input className="w-full px-2 py-1 border rounded" value={designation} onChange={e => setDesignation(e.target.value)} required />
              <label className="block text-xs font-medium mb-1 mt-4">Montant</label>
              <input type="number" className="w-full px-2 py-1 border rounded" value={montant} onChange={e => setMontant(Number(e.target.value))} required />
              <label className="block text-xs font-medium mb-1 mt-4">Catégorie</label>
              <input className="w-full px-2 py-1 border rounded bg-gray-100" value="semestre" disabled />
              <div className="mt-4">
                <label className="block text-xs font-medium mb-1">Image</label>
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUpload} className="hidden" />
                  <button type="button" className="px-3 py-1 bg-blue-600 text-white rounded text-xs" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Chargement...' : 'Charger une image'}
                  </button>
                  {image && <img src={image} alt="aperçu" className="h-10 w-10 object-cover rounded" />}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Caractéristiques</label>
              {caracteristiques.map((c, i) => (
                <div key={i} className="flex gap-2 mb-2 items-start">
                  <textarea
                    className="w-full px-2 py-1 border rounded"
                    rows={2}
                    value={c}
                    onChange={e => {
                      const arr = [...caracteristiques];
                      arr[i] = e.target.value;
                      setCaracteristiques(arr);
                    }}
                    placeholder={`Caractéristique ${i + 1}`}
                  />
                  <button type="button" className="text-red-500 font-bold px-2" onClick={() => setCaracteristiques(caracteristiques.length === 1 ? [""] : caracteristiques.filter((_, idx) => idx !== i))}>×</button>
                </div>
              ))}
              <button type="button" className="text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={() => setCaracteristiques([...caracteristiques, ""])}>Ajouter une caractéristique</button>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Avantages</label>
              {avantages.map((a, i) => (
                <div key={i} className="flex gap-2 mb-2 items-start">
                  <textarea
                    className="w-full px-2 py-1 border rounded"
                    rows={2}
                    value={a}
                    onChange={e => {
                      const arr = [...avantages];
                      arr[i] = e.target.value;
                      setAvantages(arr);
                    }}
                    placeholder={`Avantage ${i + 1}`}
                  />
                  <button type="button" className="text-red-500 font-bold px-2" onClick={() => setAvantages(avantages.length === 1 ? [""] : avantages.filter((_, idx) => idx !== i))}>×</button>
                </div>
              ))}
              <button type="button" className="text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={() => setAvantages([...avantages, ""])}>Ajouter un avantage</button>
              <label className="block text-xs font-medium mb-1 mt-4">Bénéfices</label>
              {benefice.map((b, i) => (
                <div key={i} className="flex gap-2 mb-2 items-start">
                  <textarea
                    className="w-full px-2 py-1 border rounded"
                    rows={2}
                    value={b}
                    onChange={e => {
                      const arr = [...benefice];
                      arr[i] = e.target.value;
                      setBenefice(arr);
                    }}
                    placeholder={`Bénéfice ${i + 1}`}
                  />
                  <button type="button" className="text-red-500 font-bold px-2" onClick={() => setBenefice(benefice.length === 1 ? [""] : benefice.filter((_, idx) => idx !== i))}>×</button>
                </div>
              ))}
              <button type="button" className="text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={() => setBenefice([...benefice, ""])}>Ajouter un bénéfice</button>
            </div>
          </div>
          
          {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
          {success && <div className="text-green-600 text-xs mt-2">{success}</div>}
          <button type="submit" className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm" disabled={uploading}>
            Créer le produit
          </button>
        </form>
      </div>
    </div>
  );
}
