import Dashboard from "@/components/etablissement/Dashboard";
// import DashboardWithTabs from "@/components/etablissement/DashboardWithTabs"; // Version avec onglets
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de Bord - Administration Institut | Système de Gestion Académique",
  description: "Tableau de bord principal pour la gestion administrative de l'institut. Suivi des personnels, étudiants, inscriptions et statistiques académiques en temps réel.",
  keywords: [
    "administration institut",
    "gestion académique", 
    "tableau de bord",
    "personnels",
    "étudiants",
    "inscriptions",
    "statistiques",
    "DRH",
    "gestion établissement"
  ],
  authors: [{ name: "Institut Admin Team" }],
  creator: "Institut Administration System",
  publisher: "Institut Supérieur",
  robots: {
    index: false, // Pas d'indexation pour les pages admin
    follow: false,
  },
};

export default function Page() {
  return <Dashboard />;
}
