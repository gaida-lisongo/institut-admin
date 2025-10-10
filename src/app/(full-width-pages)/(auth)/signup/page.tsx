import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription - Institut Admin | Système de Gestion Académique",
  description: "Page d'inscription pour créer un nouveau compte dans le système de gestion administrative de l'institut. Accès réservé aux personnels autorisés.",
  keywords: [
    "inscription",
    "nouveau compte",
    "institut admin",
    "personnel autorisé",
    "gestion académique",
    "administration",
    "création compte"
  ],
  robots: {
    index: false, // Pas d'indexation pour les pages d'inscription
    follow: false,
  },
  openGraph: {
    title: "Inscription - Institut Admin",
    description: "Création de compte pour le système de gestion administrative",
    type: "website",
    locale: "fr_FR",
  },
};

export default function SignUp() {
  return <SignUpForm />;
}
