import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Etudiant } from "@/types/etudiant";

export const exportEtudiantsExcel = async (etudiants: Etudiant[], promotion: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Inscrits");

  // --- Header ---
  worksheet.columns = [
    { header: "Nom", key: "nom", width: 20 },
    { header: "Post-nom", key: "post_nom", width: 20 },
    { header: "Prénom", key: "prenom", width: 20 },
    { header: "Sexe", key: "sexe", width: 10 },
    { header: "Nationalité", key: "nationalite", width: 15 },
    { header: "Lieu de naissance", key: "lieu_naissance", width: 20 },
    { header: "Date de naissance", key: "date_naissance", width: 15 },
    { header: "Matricule", key: "matricule", width: 15 },
    { header: "Solde", key: "solde", width: 10 },
  ];

  // --- Rows ---
  etudiants.forEach((etudiant) => {
    worksheet.addRow({
      nom: etudiant.nom,
      post_nom: etudiant.post_nom,
      prenom: etudiant.prenom,
      sexe: etudiant.sexe,
      nationalite: etudiant.nationalite,
      lieu_naissance: etudiant.lieu_naissance,
      date_naissance: new Date(etudiant.date_naissance).toLocaleDateString("fr-FR"),
      matricule: etudiant.matricule,
      solde: etudiant.solde || 0,
    });
  });

  // --- Style header ---
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { horizontal: "center" };

  // --- Export ---
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Inscrits_${promotion}.xlsx`);
};
