"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Annee } from "@/services/AnneeService";
import { Classe, Cycle } from "@/services/CycleService";
import { Etudiant } from "@/types/etudiant";
import { exportEtudiantsExcel } from "@/utils/exportEtudiants";
import CycleService from "@/services/CycleService";
import { ChevronLeft, ChevronRight, Search, Download, Loader2, Check, X, Trash2 } from "lucide-react";

interface EtudiantsDataTableProps {
  cycle: Cycle;
  classe: Classe;
  annee: Annee;
  onBack: () => void;
}

interface Inscription {
  _id: string;
  etudiant: Etudiant;
  classe: string;
  annee: Annee;
  status: "PENDING" | "OK" | "NO";
  faculteId: string;
  etabId: string;
  createdAt: Date;
}

const EtudiantsDataTable = ({ cycle, classe, annee, onBack }: EtudiantsDataTableProps) => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction simple pour charger une page
  const fetchPageData = useCallback(async (page: number) => {
    setIsLoading(true);

    try {
      const data = await CycleService.fetchInscrits(classe._id!, annee._id!, page.toString());
      setInscriptions(data);
    } catch (error) {
      console.error("Erreur de chargement :", error);
    } finally {
      setIsLoading(false);
    }
  }, [classe._id, annee._id]);


  // Chargement initial
  useEffect(() => {
    fetchPageData(1);
  }, [fetchPageData]);

  // Filtrage local pour la recherche
  const filteredInscriptions = inscriptions.filter((i) => {
    if (search.trim() === "") return true;
    const name = `${i.etudiant.nom} ${i.etudiant.post_nom || ""} ${i.etudiant.prenom || ""}`.toLowerCase();
    const matricule = i.etudiant.matricule?.toLowerCase() || "";
    const searchTerm = search.toLowerCase();
    return name.includes(searchTerm) || matricule.includes(searchTerm);
  });

  // Actions
  const updateInscrit = async (id: string, status: "PENDING" | "OK" | "NO") => {
    try {
      const res = await fetch(
        `https://server-gr.he-section.site/api/v1/etudiant/parcours/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Mise à jour locale
      setInscriptions(prev => prev.map(i => i._id === id ? { ...i, status } : i));
    } catch (error) {
      console.error("Erreur de mise à jour :", error);
    }
  };

  const deleteInscrit = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette inscription ?")) return;
    try {
      await fetch(`https://server-gr.he-section.site/api/v1/etudiant/parcours/${id}`, {
        method: "DELETE",
      });
      setInscriptions(prev => prev.filter(i => i._id !== id));
    } catch (error) {
      console.error("Erreur de suppression :", error);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchPageData(prevPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPageData(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      OK: { label: "Validé", color: "bg-green-100 text-green-800", icon: Check },
      NO: { label: "Refusé", color: "bg-red-100 text-red-800", icon: X },
      PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Loader2 }
    };
    
    const { label, color, icon: Icon } = config[status as keyof typeof config] || config.PENDING;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  if (isLoading && inscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des étudiants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
            Retour
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {cycle.designation} - {classe.designation}
            </h1>
            <p className="text-gray-600">Année académique {annee.debut}-{annee.fin}</p>
          </div>

          <button
            onClick={() => exportEtudiantsExcel(
              inscriptions.map(i => i.etudiant), 
              `${classe.designation}_${annee.debut}-${annee.fin}`
            )}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={20} />
            Exporter Excel
          </button>
        </div>

        {/* Barre de recherche et statistiques */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou matricule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Page {currentPage}</span>
            <span>•</span>
            <span>{filteredInscriptions.length} étudiants affichés</span>
            {search && (
              <>
                <span>•</span>
                <span>Recherche active</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1 || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
          Précédent
        </button>

        <div className="text-sm text-gray-600">
          Navigation par boutons uniquement
        </div>

        <button
          onClick={goToNextPage}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Suivant
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Table des étudiants */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matricule
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nationalité
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date inscription
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInscriptions.map((inscription, index) => {
                const { etudiant, status, _id, createdAt } = inscription;
                
                return (
                  <tr 
                    key={_id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {etudiant.photo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={etudiant.photo}
                              alt={`${etudiant.nom} ${etudiant.prenom}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                              {`${etudiant.nom[0]}${etudiant.prenom?.[0] || ''}`.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {etudiant.nom} {etudiant.post_nom} {etudiant.prenom}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {etudiant.matricule}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {etudiant.nationalite}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(status)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {/* Toggle de validation */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={status === "OK"}
                            onChange={(e) => updateInscrit(_id, e.target.checked ? "OK" : "NO")}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        
                        {/* Bouton de suppression */}
                        <button
                          onClick={() => deleteInscrit(_id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer l'inscription"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>


        {/* Message si aucun résultat */}
        {filteredInscriptions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun étudiant trouvé</h3>
            <p className="text-gray-600">
              {search ? `Aucun résultat pour "${search}"` : "Aucun étudiant inscrit dans cette classe"}
            </p>
          </div>
        )}
      </div>

      {/* Footer avec informations de pagination */}
      <div className="mt-6 flex justify-center items-center text-sm text-gray-600">
        <div>
          Page {currentPage} • {filteredInscriptions.length} étudiants affichés
        </div>
      </div>
    </div>
  );
};

export default EtudiantsDataTable;
