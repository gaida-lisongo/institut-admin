import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion - Institut Admin | Système de Gestion Académique",
  description: "Page de connexion sécurisée pour accéder au système de gestion administrative de l'institut. Authentification requise pour les personnels autorisés.",
  keywords: [
    "connexion",
    "authentification",
    "institut admin",
    "système sécurisé",
    "gestion académique",
    "personnel autorisé",
    "administration"
  ],
  robots: {
    index: false, // Pas d'indexation pour les pages de connexion
    follow: false,
  },
  openGraph: {
    title: "Connexion - Institut Admin",
    description: "Accès sécurisé au système de gestion administrative",
    type: "website",
    locale: "fr_FR",
  },
};

export default function SignIn() {
  return <SignInForm />;
}
