"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { AdminService } from "@/services/AdminService";
import { AgentService } from "@/services/AgentService";
import useAdminStore from "@/stores/adminStore";
import useAuthStore from "@/stores/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function SignInForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const {
    loading,
    admins,
    setAdmins
  } = useAdminStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Refs pour récupérer les valeurs des champs
  const matriculeRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Récupération des valeurs depuis les refs
      const matricule = matriculeRef.current?.value || "";
      const password = passwordRef.current?.value || "";

      // Validation des champs
      if (!matricule.trim()) {
        throw new Error("Le matricule est requis");
      }
      if (!password.trim()) {
        throw new Error("Le mot de passe est requis");
      }

      // Appel à l'API d'authentification
      const result = await AgentService.login(matricule, password);
      console.log("Réponse de l'API:", result);
      const { token, agent } = result;
      // Vérifier la structure de la réponse
      if (!token || !agent) {
        throw new Error(result.message || "Erreur lors de l'authentification");
      }

      if (!token || !agent) {
        throw new Error("Réponse invalide du serveur");
      }

      if (!agent._id) {
        throw new Error("ID de l'agent non valide");
      }
      
      const userIsAdmin = isUserAdmin(agent._id);
      if (!userIsAdmin) {
        throw new Error("Vous n'avez pas les privilèges d'accès. Contactez l'administrateur.");
      }

      localStorage.setItem("auth-token", token);
      // Sauvegarder dans le store
      login(token, agent);

      console.log("Utilisateur connecté:", agent);

      // Rediriger vers le dashboard
      router.push("/");
      
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadingPrivileges = async () => {
      try {
        const adminsList = await AdminService.getAdmins();
        setAdmins(adminsList);
      } catch (error) {
        console.error("Erreur lors du chargement des admins:", error);
      }
    };
    loadingPrivileges();
  }, []);

  const isUserAdmin = (currentId: string) => {
    console.log("Vérification des privilèges pour l'ID:", currentId);
    console.log("Liste des admins:", admins);
    return admins.some((admin) => admin.userId._id === currentId);
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Connexion Agent
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Entrez votre matricule et mot de passe pour vous connecter!
            </p>
          </div>
          
          {/* Affichage de l'erreur */}
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg dark:bg-red-900/50 dark:text-red-400 dark:border-red-700">
              {error}
            </div>
          )}
          
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Matricule <span className="text-error-500">*</span>{" "}
                  </Label>
                  <input
                    ref={matriculeRef}
                    placeholder="Entrez votre matricule" 
                    type="text"
                    disabled={isLoading}
                    onChange={() => setError("")} // Effacer l'erreur lors de la saisie
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label>
                    Mot de passe <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <input
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre mot de passe"
                      disabled={isLoading}
                      onChange={() => setError("")} // Effacer l'erreur lors de la saisie
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
