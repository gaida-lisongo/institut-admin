import React, { useState } from "react";
import type { ProduitFormData } from '@/services/ProduitService';

interface ModalEditProduitProps {
  open: boolean;
  produit: any;
  onClose: () => void;
  onSave: (data: ProduitFormData) => Promise<void>;
}


import { useEffect } from "react";

export default function ModalEditProduit({ open, produit, onClose, onSave }: ModalEditProduitProps) {
  const [form, setForm] = useState<ProduitFormData>({
    designation: "",
    montant: 0,
    categorie: [],
    caracteristiques: [],
    avantages: [],
    benefice: [],
    image: "",
    sectionId: "",
    anneeId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    if (open && produit) {
      setForm({
        designation: produit.designation || "",
        montant: produit.montant || 0,
        categorie: Array.isArray(produit.categorie) ? produit.categorie : (produit.categorie ? [produit.categorie] : []),
        caracteristiques: Array.isArray(produit.caracteristiques) ? produit.caracteristiques : (produit.caracteristiques ? String(produit.caracteristiques).split('\n') : []),
        avantages: Array.isArray(produit.avantages) ? produit.avantages : (produit.avantages ? String(produit.avantages).split('\n') : []),
        benefice: Array.isArray(produit.benefice) ? produit.benefice : (produit.benefice ? String(produit.benefice).split('\n') : []),
        image: produit.image || "",
        sectionId: produit.sectionId || "",
        anneeId: produit.anneeId || "",
      });
    }
  }, [open, produit]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleArrayChange = (name: keyof ProduitFormData, value: string) => {
    setForm(f => ({ ...f, [name]: value.split('\n') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Modifier le produit</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-medium mb-1">Désignation</label>
            <input name="designation" value={form.designation} onChange={handleChange} className="w-full border rounded p-2" required />
            <label className="block text-xs font-medium mb-1 mt-4">Montant</label>
            <input name="montant" type="number" value={form.montant} onChange={handleChange} className="w-full border rounded p-2" required />
            <label className="block text-xs font-medium mb-1 mt-4">Catégorie (séparées par virgule)</label>
            <input name="categorie" value={form.categorie.join(", ")} onChange={e => setForm(f => ({ ...f, categorie: e.target.value.split(",").map(s => s.trim()) }))} className="w-full border rounded p-2" />
            <label className="block text-xs font-medium mb-1 mt-4">Image (URL)</label>
            <input name="image" value={form.image} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Caractéristiques</label>
            {form.caracteristiques.map((c, i) => (
              <div key={i} className="flex gap-2 mb-2 items-start">
                <textarea
                  className="w-full px-2 py-1 border rounded"
                  rows={2}
                  value={c}
                  onChange={e => {
                    const arr = [...form.caracteristiques];
                    arr[i] = e.target.value;
                    setForm(f => ({ ...f, caracteristiques: arr }));
                  }}
                  placeholder={`Caractéristique ${i + 1}`}
                />
                <button type="button" className="text-red-500 font-bold px-2" onClick={() => setForm(f => ({ ...f, caracteristiques: f.caracteristiques.length === 1 ? [""] : f.caracteristiques.filter((_, idx) => idx !== i) }))}>×</button>
              </div>
            ))}
            <button type="button" className="text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={() => setForm(f => ({ ...f, caracteristiques: [...f.caracteristiques, ""] }))}>Ajouter une caractéristique</button>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Avantages</label>
            {form.avantages.map((a, i) => (
              <div key={i} className="flex gap-2 mb-2 items-start">
                <textarea
                  className="w-full px-2 py-1 border rounded"
                  rows={2}
                  value={a}
                  onChange={e => {
                    const arr = [...form.avantages];
                    arr[i] = e.target.value;
                    setForm(f => ({ ...f, avantages: arr }));
                  }}
                  placeholder={`Avantage ${i + 1}`}
                />
                <button type="button" className="text-red-500 font-bold px-2" onClick={() => setForm(f => ({ ...f, avantages: f.avantages.length === 1 ? [""] : f.avantages.filter((_, idx) => idx !== i) }))}>×</button>
              </div>
            ))}
            <button type="button" className="text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={() => setForm(f => ({ ...f, avantages: [...f.avantages, ""] }))}>Ajouter un avantage</button>
            <label className="block text-xs font-medium mb-1 mt-4">Bénéfices</label>
            {form.benefice.map((b, i) => (
              <div key={i} className="flex gap-2 mb-2 items-start">
                <textarea
                  className="w-full px-2 py-1 border rounded"
                  rows={2}
                  value={b}
                  onChange={e => {
                    const arr = [...form.benefice];
                    arr[i] = e.target.value;
                    setForm(f => ({ ...f, benefice: arr }));
                  }}
                  placeholder={`Bénéfice ${i + 1}`}
                />
                <button type="button" className="text-red-500 font-bold px-2" onClick={() => setForm(f => ({ ...f, benefice: f.benefice.length === 1 ? [""] : f.benefice.filter((_, idx) => idx !== i) }))}>×</button>
              </div>
            ))}
            <button type="button" className="text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={() => setForm(f => ({ ...f, benefice: [...f.benefice, ""] }))}>Ajouter un bénéfice</button>
          </div>
        </div>
        {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
