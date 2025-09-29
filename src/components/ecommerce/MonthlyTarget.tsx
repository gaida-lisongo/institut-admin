"use client";
import { useEffect, useState } from "react";
import useAuthStore from "@/stores/authStore";
import { useAnneeStore } from "@/stores/anneeStore";
import { useSectionStore } from "@/stores/sectionStore";
import { Loader } from "lucide-react";

export default function MonthlyTarget() {
  const { menuData } = useAuthStore();
  const { annees, isLoading: isLoadingAnnees, fetchAnnees } = useAnneeStore();
  const { sections, isLoading: isLoadingSections, fetchSections } = useSectionStore();
  const [data, setData ] = useState<{
    _id: string;
    image: string;
    titre: string;
    annee: string;
    section: string;
    montant: number;
    commandes: any[];
    categorie: string;
    avantages: string;
  }[] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{
    _id: string;
    image: string;
    titre: string;
    annee: string;
    section: string;
    montant: number;
    commandes: any[];
    categorie: string;
    avantages: string;
  } | null>(null);

  useEffect(() => {
    fetchAnnees();
    fetchSections();
  }, []);

  useEffect(() => {
    const { commandes } = menuData.courses;
    console.log("commandes : ", commandes);

    let items : {
      _id: string;
      image: string;
      titre: string;
      annee: string;
      section: string;
      montant: number;
      commandes: any[];
      categorie: string;
      avantages: string;
    }[] = [];
    
    if (commandes) {
      commandes.forEach((commande) => {
      const {
        _id,
        image,
        designation,
        anneeId,
        sectionId,
        montant,
        commandes,
        categorie,
        avantages,
      } = commande;

      const annee = annees?.find((annee) => annee?._id?.toString() === anneeId?.toString());
      const section = sections?.find((section) => section?._id?.toString() === sectionId?.toString());

      if(!annee || !section) return;

      items.push({
        _id : _id || "",
        image : image || "",
        titre: designation,
        annee: `${annee?.debut} - ${annee?.fin}`,
        section: section?.description.sigle,
        montant : montant || 0,
        commandes: commandes || [],
        categorie: categorie?.[0] || "",
        avantages : avantages?.map((avantage) => avantage).join("\n") || "",
        });
      });
    }
    setData(items);
    setSelectedProduct(items[0]);
  }, [menuData, annees, sections]);

  // Calculer le chiffre d'affaires
  const nombreCommandes = selectedProduct?.commandes?.length || 0;
  const prixUnitaire = selectedProduct?.montant || 0;
  const chiffreAffaires = prixUnitaire * nombreCommandes;

  if(isLoadingAnnees || isLoadingSections || !selectedProduct) return <Loader />;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6">
      {/* En-tête avec sélection de produit */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            
            {selectedProduct?.section || "Aucune section sélectionnée"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedProduct?.categorie || "Aucun produit sélectionné"}
          </p>
        </div>
        
        {data && data.length > 0 && (
          <select 
            value={selectedProduct?._id || ""} 
            onChange={(e) => {
              const product = data.find(p => p._id === e.target.value);
              if (product) setSelectedProduct(product);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            {data.map((product) => (
              <option key={product._id} value={product._id}>
                {product.titre}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Affichage simple du revenu */}
      <div className="text-center py-8">
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{selectedProduct?.titre || "Aucune catégorie sélectionnée"}</p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {prixUnitaire.toLocaleString()} FC × {nombreCommandes} commandes
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
            Revenu total
          </p>
          <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
            {chiffreAffaires.toLocaleString()} FC
          </p>
        </div>

        {/* Détails supplémentaires */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-500 dark:text-gray-400">Prix unitaire</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {prixUnitaire.toLocaleString()} FC
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-gray-500 dark:text-gray-400">Année</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {selectedProduct?.annee || "Aucune année sélectionnée"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
