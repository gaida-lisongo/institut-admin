"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { usePersonnelStore } from "@/stores/personnelStore";
import { Loader, Search, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Personnel } from "@/types/personnel";
import DocumentsModal from "../personnel/DocumentsModal";


export default function RecentOrders() {
  const { personnels, loadPersonnels, isLoading } = usePersonnelStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  
  const itemsPerPage = 100;

  useEffect(() => {
    loadPersonnels();
  }, []);

  // Filtrage des personnels basé sur la recherche
  const filteredPersonnels = useMemo(() => {
    if (!searchTerm.trim()) return personnels;
    
    const searchLower = searchTerm.toLowerCase();
    return personnels.filter((personnel) => 
      personnel.nomComplet?.toLowerCase().includes(searchLower) ||
      personnel.matricule?.toLowerCase().includes(searchLower) ||
      personnel.niveau?.toLowerCase().includes(searchLower) ||
      personnel.grade?.toLowerCase().includes(searchLower)
    );
  }, [personnels, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredPersonnels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPersonnels = filteredPersonnels.slice(startIndex, endIndex);

  // Réinitialiser la page quand la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDocumentsView = (personnel: Personnel) => {
    setSelectedPersonnel(personnel);
    setIsDocumentsModalOpen(true);
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
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Personnels ({filteredPersonnels.length})
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} sur {totalPages} • {itemsPerPage} agents par page
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, matricule, niveau ou grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Agent
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Niveau
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Grade
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Documents
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {currentPersonnels.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center" {...({ colSpan: 5 } as any)}>
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? "Aucun personnel trouvé pour cette recherche" : "Aucun personnel disponible"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentPersonnels.map((personnel) => (
                <TableRow key={personnel._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {personnel.photo ? (
                          <Image
                            width={50}
                            height={50}
                            src={personnel.photo}
                            className="h-[50px] w-[50px] object-cover"
                            alt={personnel.nomComplet || 'Personnel'}
                          />
                        ) : (
                          <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                            {personnel.nomComplet?.charAt(0) || 'P'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {personnel.nomComplet || 'N/A'}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {personnel.matricule || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {personnel.niveau || 'N/A'}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {personnel.grade || 'N/A'}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={
                        personnel.documents?.length > 0
                          ? "success"
                          : "error"
                      }
                    >
                      {personnel.documents?.length > 0 ? `${personnel.documents.length} doc${personnel.documents.length > 1 ? 's' : ''}` : "Aucun"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <button
                      onClick={() => handleDocumentsView(personnel)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Voir les documents"
                    >
                      <FileText className="w-4 h-4" />
                      Voir
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
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Affichage de {startIndex + 1} à {Math.min(endIndex, filteredPersonnels.length)} sur {filteredPersonnels.length} agents
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal des documents */}
      {selectedPersonnel && (
        <DocumentsModal
          isOpen={isDocumentsModalOpen}
          onClose={() => {
            setIsDocumentsModalOpen(false);
            setSelectedPersonnel(null);
          }}
          personnel={selectedPersonnel}
        />
      )}
    </div>
  );
}
