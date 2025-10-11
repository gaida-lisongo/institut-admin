"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { useEtablissementStore } from "@/stores/etablissementStore";
import { useProvinceStore } from "@/stores/provinceStore";
import { Loader, Search, Users, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { ComiteGestionModal } from "./ComiteGestionModal";
import { Etablissement, EtablissementPopulated } from "@/types/etablissement";

export default function EtablissementsList() {
  const { etablissements, fetchEtablissements, isLoading } = useEtablissementStore();
  const { provinces, fetchProvinces } = useProvinceStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEtablissement, setSelectedEtablissement] = useState<EtablissementPopulated | null>(null);
  const [isComiteModalOpen, setIsComiteModalOpen] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEtablissements();
    fetchProvinces();
  }, []);

  // Fonction pour obtenir le nom de la province
  const getProvinceName = (provinceId) => {
    const province = provinces.find((p) => p._id === provinceId._id);
    return province ? `${province.code} - ${province.designation}` : "N/A";
  };

  // Filtrage des établissements basé sur la recherche
  const filteredEtablissements = useMemo(() => {
    if (!searchTerm.trim()) return etablissements;
    
    const searchLower = searchTerm.toLowerCase();
    return etablissements.filter((etab) => 
      etab.designation?.toLowerCase().includes(searchLower) ||
      etab.sigle?.toLowerCase().includes(searchLower) ||
      etab.reference?.toLowerCase().includes(searchLower) ||
      getProvinceName(etab.provinceId).toLowerCase().includes(searchLower)
    );
  }, [etablissements, searchTerm, provinces]);

  // Pagination
  const totalPages = Math.ceil(filteredEtablissements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEtablissements = filteredEtablissements.slice(startIndex, endIndex);

  // Réinitialiser la page quand la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleComiteView = (etablissement: Etablissement) => {
    setSelectedEtablissement(etablissement);
    setIsComiteModalOpen(true);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Établissements ({filteredEtablissements.length})
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} sur {totalPages} • {itemsPerPage} établissements par page
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, sigle, référence ou province..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="min-w-[280px]">Établissement</TableCell>
                <TableCell className="min-w-[150px]">Référence</TableCell>
                <TableCell className="min-w-[200px]">Province</TableCell>
                <TableCell className="min-w-[120px]">Catégorie</TableCell>
                <TableCell className="min-w-[150px] text-center">Comité de Gestion</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEtablissements.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Aucun établissement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                currentEtablissements.map((etablissement) => (
                  <TableRow key={etablissement._id}>
                    {/* Colonne 1: Établissement (logo, sigle, designation) */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                          {etablissement.logo ? (
                            <Image
                              src={etablissement.logo}
                              alt={etablissement.sigle}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
                              {etablissement.sigle?.charAt(0) || 'E'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {etablissement.sigle}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {etablissement.designation}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Colonne 2: Référence */}
                    <TableCell>
                      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                        {etablissement.reference || "N/A"}
                      </span>
                    </TableCell>

                    {/* Colonne 3: Province */}
                    <TableCell>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getProvinceName(etablissement.provinceId)}
                      </span>
                    </TableCell>

                    {/* Colonne 4: Catégorie */}
                    <TableCell>
                      <Badge
                        color={etablissement.categorie === "public" ? "success" : "warning"}
                      >
                        {etablissement.categorie === "public" ? "Public" : "Privé"}
                      </Badge>
                    </TableCell>

                    {/* Colonne 5: Comité de Gestion */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleComiteView(etablissement)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      >
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Voir</span>
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                          {etablissement.coge?.length || 0}
                        </span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredEtablissements.length)} sur{" "}
              {filteredEtablissements.length} établissements
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Comité de Gestion */}
      {selectedEtablissement && (
        <ComiteGestionModal
          isOpen={isComiteModalOpen}
          onClose={() => {
            setIsComiteModalOpen(false);
            setSelectedEtablissement(null);
          }}
          comite={selectedEtablissement.coge as {
          membreId: {
            _id: string;
            nom: string;
            prenom: string;
            email: string
          };
          role: 'DG' | 'SGACAD' | 'SGAD' | 'SGR' | 'AB';
          
        }[] || []}
          etablissementName={`${selectedEtablissement.sigle} - ${selectedEtablissement.designation}`}
        />
      )}
    </>
  );
}
