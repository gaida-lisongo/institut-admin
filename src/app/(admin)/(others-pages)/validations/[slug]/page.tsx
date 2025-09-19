"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useProduitStore } from "@/stores/produitStore";
import ModalCreateProduit from "@/components/ecommerce/ModalCreateProduit";
import ModalEditProduit from "@/components/ecommerce/ModalEditProduit";
import ModalConfirm from "@/components/ecommerce/ModalConfirm";

export default function ProduitsValidationPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const sectionId = (slug?.split("-")[1] || "") + "";
  const anneeId = (slug?.split("-")[0] || "") + "";

  const { produits, fetchProduits, createProduit, updateProduit, deleteProduit } = useProduitStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editProduit, setEditProduit] = useState<any|null>(null);
  const [deleteProduitId, setDeleteProduitId] = useState<string|null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");

  React.useEffect(() => { fetchProduits(); }, []);

  const produitsValidation = produits.filter(p =>
    p.categorie && p.categorie[0] === 'validation' &&
    String(p.sectionId) === sectionId &&
    String(p.anneeId) === anneeId &&
    (
      p.designation.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(p.benefice) && p.benefice.join(" ").toLowerCase().includes(search.toLowerCase()))
    )
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Produits de validation</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm shadow"
          onClick={() => setShowCreate(true)}
        >
          Créer un produit de validation
        </button>
      </div>
      <div className="overflow-x-auto mt-4 mb-10">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 text-gray-700 dark:text-gray-200">
              <th className="p-3 border-b font-semibold">Image</th>
              <th className="p-3 border-b font-semibold">Désignation</th>
              <th className="p-3 border-b font-semibold">Montant</th>
              <th className="p-3 border-b font-semibold">Caractéristiques</th>
              <th className="p-3 border-b font-semibold">Avantages</th>
              <th className="p-3 border-b font-semibold">Bénéfices</th>
              <th className="p-3 border-b font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {produitsValidation.map((prod, idx) => (
              <tr key={prod._id || idx} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition border-b last:border-b-0">
                <td className="p-3 text-center">
                  {prod.image ? <img src={prod.image} alt={prod.designation} className="h-14 w-14 object-cover rounded shadow mx-auto" /> : <span className="text-xs text-gray-400">Aucune</span>}
                </td>
                <td className="p-3 font-semibold text-blue-900 dark:text-blue-200">{prod.designation}</td>
                <td className="p-3 text-green-700 font-bold">{prod.montant} FC</td>
                <td className="p-3 text-xs whitespace-pre-line max-w-xs">{prod.caracteristiques?.join('\n')}</td>
                <td className="p-3 text-xs whitespace-pre-line max-w-xs">{prod.avantages?.join('\n')}</td>
                <td className="p-3 text-xs whitespace-pre-line max-w-xs">{prod.benefice?.join('\n')}</td>
                <td className="p-3 text-center flex flex-col gap-2 md:flex-row md:gap-1 justify-center items-center">
                  <button onClick={() => setEditProduit(prod)} className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs font-semibold shadow">Modifier</button>
                  <button onClick={() => setDeleteProduitId(prod._id || null)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-semibold shadow">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ModalCreateProduit
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={async (data) => {
          await createProduit({ ...data, categorie: ["validation"], sectionId, anneeId });
          await fetchProduits();
          setShowCreate(false);
        }}
        sectionId={sectionId}
        anneeId={anneeId}
      />
      <ModalEditProduit
        open={!!editProduit}
        produit={editProduit}
        onClose={() => setEditProduit(null)}
        onSave={async (data) => {
          if (!editProduit) return;
          await updateProduit(editProduit._id, { ...data, categorie: ["validation"], sectionId, anneeId });
          await fetchProduits();
          setEditProduit(null);
        }}
      />
      <ModalConfirm
        open={!!deleteProduitId}
        message="Voulez-vous vraiment supprimer ce produit ?"
        onClose={() => setDeleteProduitId(null)}
        loading={deleteLoading}
        onConfirm={async () => {
          if (!deleteProduitId) return;
          setDeleteLoading(true);
          await deleteProduit(deleteProduitId);
          await fetchProduits();
          setDeleteProduitId(null);
          setDeleteLoading(false);
        }}
      />
    </div>
  );
}
