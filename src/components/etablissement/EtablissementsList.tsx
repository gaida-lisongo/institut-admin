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
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Classe } from "@/types/systemes";
import { useSystemeStore } from "@/stores/systemeStore";
import { Etudiant } from "@/types/etudiant";
import { useAnneeStore } from "@/stores/anneeStore";
import { Annee } from "@/types/annee";
import { fetchEtudiants } from "../paiements/PaiementsListModern";

export default function EtablissementsList({
  etablissement
}: { etablissement: EtablissementPopulated }) {
  const { systemes, fetchSystemes, loading } = useSystemeStore();
  const { annees, fetchAnnees } = useAnneeStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEtablissement, setSelectedEtablissement] = useState<EtablissementPopulated | null>(null);
  const [isComiteModalOpen, setIsComiteModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const itemsPerPage = 10;
  const [classes, setClasses] = useState<Classe[]>([]);
  const [selectedClass, setSelectedClass] = useState<Classe | null>(null);
  const [selectedAnnee, setSelectedAnnee] = useState<Annee | null>(null);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);

  useEffect(() => {
    fetchAnnees();
    fetchSystemes();
  }, []);

  useEffect(() => {
    if(systemes){
      systemes.forEach((s) => {
        if(s.cycles){
          s.cycles.forEach((c) => {
            if(c.classes){
              c.classes.forEach((classe) => {
                setClasses((prev) => [...prev, classe]);
              });
            }
          });
        }
      });
    }
  }, [systemes]);

  useEffect(() => {
    if(classes){
      setSelectedClass(classes[0]);
      setSelectedAnnee(annees[0]);
    }
  }, [classes]);

  useEffect(() => {
    if(selectedClass){
      fetchEtudiants(selectedClass._id, selectedAnnee._id).then((etudiants) => {
        console.log("Liste des étdiants", etudiants);
        setEtudiants(etudiants);
      });
    }
  }, [selectedClass]);

  // Filtrage des établissements basé sur la recherche
  const filteredEtudiants = useMemo(() => {
    if (!searchTerm.trim()) return etudiants;
    
    const searchLower = searchTerm.toLowerCase();
    return etudiants.filter((etudiant) => 
      etudiant.nomComplet?.toLowerCase().includes(searchLower) ||
      etudiant.matricule?.toLowerCase().includes(searchLower) ||
      etudiant.lieu_naissance?.toLowerCase().includes(searchLower) ||
      etudiant.sexe?.toLowerCase().includes(searchLower)
    );
  }, [etudiants, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredEtudiants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEtudiants = filteredEtudiants.slice(startIndex, endIndex);

  // Réinitialiser la page quand la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleParcoursView = (parcours: any) => {
    console.log("Parcours", parcours);
    // setSelectedEtablissement(parcours);
    // setIsComiteModalOpen(true);
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
  
  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  if (loading) {
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
              {etablissement?.designation}  ({selectedClass?.niveau})
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

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-48 p-2"
          >
          {
            classes && classes.map((item, index) => (
              <DropdownItem
                key={index}
                onItemClick={() => setSelectedClass(item)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                {item.niveau} ({item.credit})
              </DropdownItem>
            ))
          }
          </Dropdown>
        </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="min-w-[280px]">Etudiant</TableCell>
                <TableCell className="min-w-[150px]">Origne</TableCell>
                <TableCell className="min-w-[200px]">Sexe</TableCell>
                <TableCell className="min-w-[120px]">Âge</TableCell>
                <TableCell className="min-w-[150px] text-center">Parcours</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEtudiants.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Aucun étudiant trouvé
                  </TableCell>
                </TableRow>
              ) : (
                currentEtudiants.map((etudiant, idx) => (
                  <TableRow key={idx}>
                    {/* Colonne 1: Établissement (logo, sigle, designation) */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                          {etudiant ? (
                            <Image
                              src={etudiant.photo}
                              alt={etudiant.nomComplet}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
                              {etudiant.nomComplet?.charAt(0) || 'E'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {etudiant.nomComplet}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {etudiant.matricule}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Colonne 2: Référence */}
                    <TableCell>
                      <p>
                        {etudiant.nationalite || "N/A"}
                      </p>
                      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                        {etudiant.lieu_naissance || "N/A"}
                      </span>
                    </TableCell>

                    {/* Colonne 3: Province */}
                    <TableCell>
                      <Badge
                        color={etudiant.sexe === "Masculin" ? "success" : "warning"}
                      >
                        {etudiant.sexe}
                      </Badge>
                    </TableCell>

                    {/* Colonne 4: Age */}
                    <TableCell>
                      <Badge
                        color={etudiant.age > 18 ? "success" : "warning"}
                      >
                        {etudiant.age}
                      </Badge>
                    </TableCell>

                    {/* Colonne 5: Comité de Gestion */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleParcoursView(etudiant?.parcours)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      >
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Voir</span>
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                          {etudiant?.parcours?.length || 0}
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
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredEtudiants.length)} sur{" "}
              {filteredEtudiants.length} etudiants
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
