"use client";

import React, { useEffect, useState } from "react";
import useSemestreStore from "@/stores/semestreStore";
import { useProduitStore } from "@/stores/produitStore";
import ProduitService from "@/services/ProduitService";
import type { ProduitFormData } from '@/services/ProduitService';
import ModalCreateProduit from "@/components/ecommerce/ModalCreateProduit";
import ModalEditProduit from "@/components/ecommerce/ModalEditProduit";
import ModalConfirm from "@/components/ecommerce/ModalConfirm";
import SemestreService from "@/services/SemestreService";
import CycleService, { Cycle, Classe } from "@/services/CycleService";

type ClasseWithCycle = Classe & { cycleDesignation: string };
import { useParams } from "next/navigation";
import { Semestre } from "@/types/etudiant";

export default function ClassesBySectionPage() {
  const [editProduit, setEditProduit] = useState<any|null>(null);
  const [deleteProduitId, setDeleteProduitId] = useState<string|null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const params = useParams();
  // slug format: [anneeId-sectionId]
  const slug = params?.slug as string;
  const sectionId = (slug?.split("-")[1] || "") + "";
  const anneeId = (slug?.split("-")[0] || "") + "";
  // (déjà déclaré plus bas)
  // Recherche produits semestre
  const [searchProduit, setSearchProduit] = useState("");

  const [classes, setClasses] = useState<ClasseWithCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [semestreDetailId, setSemestreDetailId] = useState<string | null>(null);
  // Modal création produit
  const [showCreateProduit, setShowCreateProduit] = useState(false);
  const [createError, setCreateError] = useState<string|null>(null);
  const [createSuccess, setCreateSuccess] = useState<string|null>(null);
  const [cycleFilter, setCycleFilter] = useState<string>("");
  const [openSemestres, setOpenSemestres] = useState<string | null>(null); // classe._id
  const { semestres, fetchSemestres, updateSemestre } = useSemestreStore();
  const { produits, fetchProduits, createProduit, updateProduit, deleteProduit } = useProduitStore();

  // Filtrer produits de catégorie 'semestre' pour la section et l'année courante
  const produitsSemestre = produits.filter(p =>
    p.categorie && p.categorie[0] === 'semestre' &&
    String(p.sectionId) === sectionId &&
    String(p.anneeId) === anneeId &&
    (
      p.designation.toLowerCase().includes(searchProduit.toLowerCase()) ||
      (Array.isArray(p.benefice) && p.benefice.join(" ").toLowerCase().includes(searchProduit.toLowerCase()))
    )
  );

  useEffect(() => {
    if (!sectionId) return;
    setLoading(true);
    CycleService.getCyclesBySection(sectionId)
      .then((cycles: Cycle[]) => {
        const allClasses: ClasseWithCycle[] = cycles.flatMap(cycle => cycle.classes.map(classe => ({
          ...classe,
          cycleDesignation: cycle.designation,
          cycleId: cycle._id
        })));
        setClasses(allClasses);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erreur lors du chargement des classes");
        setLoading(false);
      });
    fetchSemestres();
    fetchProduits();
  }, [sectionId]);

  if (!slug) return <div className="text-red-500">Paramètre d'URL manquant.</div>;
  if (loading) return <div>Chargement des classes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Préparer les cycles pour le filtre
  const cycles = Array.from(new Set(classes.map(c => c.cycleDesignation)));

  // Filtrage
  const filteredClasses = classes.filter(classe =>
    (!cycleFilter || classe.cycleDesignation === cycleFilter) &&
    (
      classe.designation.toLowerCase().includes(search.toLowerCase()) ||
      classe.description.toLowerCase().includes(search.toLowerCase())
    )
  );

  const renderClasses = () => (
    <div>
      <h2 className="text-xl font-semibold mb-6">Classes de la section</h2>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher une classe..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
        />
        <select
          value={cycleFilter}
          onChange={e => setCycleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-60"
        >
          <option value="">Tous les cycles</option>
          {cycles.map((cycle, idx) => (
            <option key={idx} value={cycle}>{cycle}</option>
          ))}
        </select>
      </div>
      {filteredClasses.length === 0 ? (
        <div className="text-gray-500">Aucune classe trouvée pour cette section.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classe, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
              <div className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{classe.designation}</div>
              <div className="text-sm text-gray-500 mb-1">Cycle : {classe.cycleDesignation}</div>
              <div className="text-xs text-gray-400 mb-2">{classe.description}</div>
              <button
                className="text-blue-600 hover:underline text-sm self-start mb-2"
                onClick={() => setOpenSemestres(openSemestres === classe._id ? null : classe._id || null)}
              >
                {openSemestres === classe._id ? 'Masquer les semestres' : 'Voir les semestres'}
              </button>
              {openSemestres === classe._id && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mt-2">
                  <div className="font-semibold text-xs text-gray-700 dark:text-gray-200 mb-2">Semestres :</div>
                  {classe.semestres && classe.semestres.length > 0 ? (
                    <ul className="list-disc ml-5">
                      {classe.semestres.map((semestreId: string) => {
                        const semestre = semestres.find(s => s._id === semestreId);
                        return (
                          <li key={semestreId} className="mb-1">
                            {semestre ? (
                              <button
                                className="text-blue-700 hover:underline font-medium"
                                onClick={() => setSemestreDetailId(semestre._id!)}
                              >
                                {semestre.designation}
                              </button>
                            ) : (
                              <span className="text-gray-400">Semestre inconnu ({semestreId})</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-gray-400 text-xs">Aucun semestre associé.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSemestre = () => {
  const semestre = semestres.find(s => s._id === semestreDetailId);
  if (!semestre) return <div className="text-gray-500">Semestre introuvable.</div>;

  // Afficher les produits associés à chaque inscription
  return (
      <div>
        <button className="mb-4 text-blue-600 hover:underline" onClick={() => setSemestreDetailId(null)}>
          ← Retour aux classes
        </button>
        <h2 className="text-2xl font-bold mb-6 text-blue-900 dark:text-blue-200">Détail du semestre : {semestre.designation}</h2>
        <div className="mb-4 text-gray-700 dark:text-gray-200 text-base">{semestre.description}</div>
        <div className="font-semibold mb-2 text-lg text-gray-800 dark:text-gray-100">Produits associés à ce semestre :</div>

        <div className="mt-10">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm shadow"
            onClick={() => setShowCreateProduit(true)}
          >
            Créer et associer un produit
          </button>
          <ModalCreateProduit
            open={showCreateProduit}
            onClose={() => setShowCreateProduit(false)}
            onCreate={async (data) => {
              setCreateError(null);
              setCreateSuccess(null);
              try {
                // Création du produit (retourne l'objet créé)
                const produitCree = await ProduitService.createProduit(data);
                await fetchProduits(); // refresh produits
                // Associer le produit au semestre (ajout dans insription)
                if (semestre && produitCree && produitCree._id) {
                  const nouvelleInsription = Array.isArray(semestre.insription) ? [...semestre.insription] : [];
                  nouvelleInsription.push({ anneeId: semestre.insription?.[0]?.anneeId || anneeId, produitId: produitCree._id });
                  await SemestreService.updateSemestre(semestre._id!, { insription: nouvelleInsription });
                  fetchSemestres(); // refresh
                }
                setCreateSuccess('Produit créé et associé au semestre !');
                setShowCreateProduit(false);
              } catch (err: any) {
                setCreateError(err?.message || 'Erreur lors de la création ou association du produit');
              }
            }}
            sectionId={slug?.split("-")[1] || ""}
            anneeId={slug?.split("-")[0] || ""}
          />
          {createError && <div className="text-red-500 text-xs mt-2">{createError}</div>}
          {createSuccess && <div className="text-green-600 text-xs mt-2">{createSuccess}</div>}
        </div>
        {renderProduits(
          semestre.insription?.map(i => i.produitId) || [],
          produits,
          (prod) => setEditProduit(prod),
          (prod) => setDeleteProduitId(prod._id)
        )}
        <ModalEditProduit
          open={!!editProduit}
          produit={editProduit}
          onClose={() => setEditProduit(null)}
          onSave={async (data) => {
            if (!editProduit) return;
            await updateProduit(editProduit._id, data);
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
  };

  function renderProduits(productsIds: string[], produits: any[], onEdit: (prod: any) => void, onDelete: (prod: any) => void) {
    const productsList = produits.filter(p => productsIds.includes(p._id!));
    if (productsList.length === 0) {
      return <div className="text-gray-500">Aucun produit trouvé.</div>;
    }
    return (
      <div className="overflow-x-auto mt-4 mb-10">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 text-gray-700 dark:text-gray-200">
              <th className="p-3 border-b font-semibold">Image</th>
              <th className="p-3 border-b font-semibold">Désignation</th>
              <th className="p-3 border-b font-semibold">Montant</th>
              <th className="p-3 border-b font-semibold">Catégorie</th>
              <th className="p-3 border-b font-semibold">Caractéristiques</th>
              <th className="p-3 border-b font-semibold">Avantages</th>
              <th className="p-3 border-b font-semibold">Bénéfices</th>
              <th className="p-3 border-b font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsList.map((prod, idx) => (
              <tr key={prod._id || idx} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition border-b last:border-b-0">
                <td className="p-3 text-center">
                  {prod.image ? <img src={prod.image} alt={prod.designation} className="h-14 w-14 object-cover rounded shadow mx-auto" /> : <span className="text-xs text-gray-400">Aucune</span>}
                </td>
                <td className="p-3 font-semibold text-blue-900 dark:text-blue-200">{prod.designation}</td>
                <td className="p-3 text-green-700 font-bold">{prod.montant} FC</td>
                <td className="p-3 text-xs">{prod.categorie?.join(', ')}</td>
                <td className="p-3 text-xs whitespace-pre-line max-w-xs">{prod.caracteristiques?.join('\n')}</td>
                <td className="p-3 text-xs whitespace-pre-line max-w-xs">{prod.avantages?.join('\n')}</td>
                <td className="p-3 text-xs whitespace-pre-line max-w-xs">{prod.benefice?.join('\n')}</td>
                <td className="p-3 text-center flex flex-col gap-2 md:flex-row md:gap-1 justify-center items-center">
                  <button onClick={() => onEdit(prod)} className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs font-semibold shadow">Modifier</button>
                  <button onClick={() => onDelete(prod)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-semibold shadow">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      {semestreDetailId ? renderSemestre() : renderClasses()}
    </div>
  );
}
