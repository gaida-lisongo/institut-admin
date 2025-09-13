import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion AAdmin",
  description: "Page de connexion pour les agents de l'institut. Authentification sécurisée avec matricule et mot de passe.",
};

export default function SignIn() {
  return <SignInForm />;
}
