"use client";

import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { AgentService } from "@/services/AgentService";
import useAuthStore from "@/stores/authStore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Modal } from "../ui/modal";
import LoginProgress from "./LoginProgress";

const ModalResult = ({ status, type, message, onClick }: { 
  status: boolean; 
  type: "error" | "info" | "success"; 
  message: string; 
  onClick: () => void;
}) => (
  <Modal isOpen={status} onClose={onClick} className="max-w-md">
    <div className="p-8 text-center">
      {/* Icône dynamique selon le type */}
      <div className="mb-6">
        {type === "error" && (
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        {type === "success" && (
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {type === "info" && (
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Titre */}
      <h2 className={`mb-4 text-xl font-bold ${
        type === "error" 
          ? "text-red-700 dark:text-red-400" 
          : type === "success" 
            ? "text-green-700 dark:text-green-400"
            : "text-blue-700 dark:text-blue-400"
      }`}>
        {type === "error" ? "Erreur de connexion" : type === "success" ? "Connexion réussie" : "Information"}
      </h2>

      {/* Message */}
      <p className="mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
        {message}
      </p>

      {/* Bouton */}
      <Button 
        onClick={onClick} 
        className={`px-8 py-3 min-w-[120px] font-medium transition-all duration-200 ${
          type === "error"
            ? "bg-red-600 hover:bg-red-700 text-white"
            : type === "success"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {type === "success" ? "Continuer" : "Fermer"}
      </Button>
    </div>
  </Modal>  
);

export default function SignInForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"error" | "info" | "success">("info");
  const [callback, setCallback] = useState<() => void>(() => {});
  
  // États pour le debug des étapes
  const [loginSteps, setLoginSteps] = useState<Array<{
    id: string;
    label: string;
    description: string;
    status: 'pending' | 'loading' | 'success' | 'error';
    data?: any;
    error?: string;
    timestamp?: string;
  }>>([
    { id: 'validation', label: 'Vérification des identifiants', description: 'Contrôle de votre matricule et mot de passe', status: 'pending' },
    { id: 'api-call', label: 'Connexion au serveur', description: 'Authentification auprès du système', status: 'pending' },
    { id: 'token-check', label: 'Validation de l\'identité', description: 'Vérification de vos informations', status: 'pending' },
    { id: 'menu-data', label: 'Chargement des autorisations', description: 'Récupération de vos droits d\'accès', status: 'pending' },
    { id: 'storage', label: 'Sauvegarde de la session', description: 'Enregistrement de votre connexion', status: 'pending' },
    { id: 'auth-store', label: 'Finalisation', description: 'Préparation de votre espace de travail', status: 'pending' },
  ]);
  
  // Refs pour récupérer les valeurs des champs
  const matriculeRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  const showModal = (modalType: "error" | "info" | "success", modalMessage: string, modalCallback?: () => void) => {
    setType(modalType);
    setMessage(modalMessage);
    setCallback(() => modalCallback || (() => setOpenModal(false)));
    setOpenModal(true);
  };

  const updateStep = (stepId: string, status: 'pending' | 'loading' | 'success' | 'error', data?: any, error?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLoginSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, data, error, timestamp }
        : step
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les étapes
    setLoginSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const, data: undefined, error: undefined, timestamp: undefined })));
    
    // Récupération des valeurs depuis les refs
    const matricule = matriculeRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    // Démarrer la progression
    setIsLoading(true);
    setShowProgress(true);

    try {
      // ÉTAPE 1: Vérification des identifiants
      updateStep('validation', 'loading');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!matricule.trim()) {
        updateStep('validation', 'error', null, 'Matricule manquant');
        setShowProgress(false);
        showModal("error", "Veuillez saisir votre matricule pour continuer.");
        return;
      }
      
      if (!password.trim()) {
        updateStep('validation', 'error', null, 'Mot de passe manquant');
        setShowProgress(false);
        showModal("error", "Veuillez saisir votre mot de passe pour continuer.");
        return;
      }
      
      updateStep('validation', 'success', { matricule: matricule.substring(0, 3) + '***', password: '***' });

      // ÉTAPE 2: Connexion au serveur
      updateStep('api-call', 'loading');
      const result = await AgentService.login(matricule, password);
      console.log("Réponse de l'API:", result);
      updateStep('api-call', 'success', { 
        success: result.success, 
        hasToken: !!result.data?.token,
        hasAgent: !!result.data?.agent 
      });
      
      // ÉTAPE 3: Validation de l'identité
      updateStep('token-check', 'loading');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (!result.data.token || !result.data.agent) {
        updateStep('token-check', 'error', result.data, 'Identité non validée');
        setShowProgress(false);
        showModal("error", "Les identifiants fournis sont incorrects. Veuillez vérifier votre matricule et mot de passe.");
        return;
      }
      
      updateStep('token-check', 'success', { 
        tokenLength: result.data.token.length,
        agentId: result.data.agent._id,
        agentName: result.data.agent.nom + ' ' + result.data.agent.prenom
      });

      // ÉTAPE 4: Chargement des autorisations
      updateStep('menu-data', 'loading');
      const menuData = await useAuthStore.getState().fetchMenuData(result.data.agent._id!);
      
      if(!menuData || menuData.length === 0) {
        updateStep('menu-data', 'error', { menuData }, 'Aucune autorisation trouvée');
        setShowProgress(false);
        showModal("error", "Votre compte n'a pas encore de privilèges assignés. Veuillez contacter l'administrateur système pour activer votre accès.");
        return;
      }
      
      console.log("Données de privilèges:", menuData);
      updateStep('menu-data', 'success', { 
        dataLength: menuData.length,
        dataType: typeof menuData,
        firstItem: menuData[0]
      });

      // ÉTAPE 5: Sauvegarde de la session
      updateStep('storage', 'loading');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      localStorage.setItem("privileges", JSON.stringify(menuData));
      localStorage.setItem("auth-token", result.data.token);
      
      updateStep('storage', 'success', {
        menuDataSaved: true,
        tokenSaved: true,
        tokenPreview: result.data.token.substring(0, 20) + '...'
      });
      
      // ÉTAPE 6: Finalisation
      updateStep('auth-store', 'loading');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const agentForAuth = {
        ...result.data.agent,
        date_naissance: typeof result.data.agent.date_naissance === 'string' 
          ? new Date(result.data.agent.date_naissance) 
          : result.data.agent.date_naissance,
        photo: result.data.agent.photo || '', // Assurer que photo n'est pas undefined
        sexe: result.data.agent.sexe as string // Conversion du type sexe
      };
      
      login(result.data.token, agentForAuth);
      
      updateStep('auth-store', 'success', {
        userConnected: true,
        userName: agentForAuth.nom + ' ' + agentForAuth.prenom,
        userId: agentForAuth._id
      });
      
      console.log("Utilisateur connecté:", result.data.agent);

      // Attendre un peu puis terminer la progression
      setTimeout(() => {
        setShowProgress(false);
        showModal("success", "Bienvenue ! Vous êtes maintenant connecté. Redirection vers votre tableau de bord...", () => {
          setOpenModal(false);
          router.push("/");
        });
      }, 1500); // Attendre 1.5 secondes pour que l'auth soit bien enregistrée
      
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setShowProgress(false);
      showModal("error", "Une erreur s'est produite lors de la connexion. Veuillez réessayer dans quelques instants.");
    } finally {
      setIsLoading(false);
    }
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
          
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Matricule de connexion <span className="text-error-500">*</span>
                  </Label>
                  <input
                    ref={matriculeRef}
                    placeholder="Entrez votre matricule" 
                    type="text"
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                  />
                </div>
                <div>
                  <Label>
                    Mot de passe <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre mot de passe"
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 transition-colors duration-200 hover:text-blue-600"
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
                    className="w-full transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]" 
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                        <span>Connexion en cours...</span>
                      </div>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ModalResult 
        status={openModal}
        type={type}
        message={message} 
        onClick={callback} 
      />

      <LoginProgress 
        isVisible={showProgress}
        steps={loginSteps}
      />
    </div>
  );
}