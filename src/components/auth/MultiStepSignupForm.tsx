'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@/hooks/useUser';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { EyeIcon, EyeCloseIcon, ChevronLeftIcon, ArrowRightIcon } from '@/icons';
import { SignupStepOneData, SignupStepTwoData } from '@/types/user';
import SignupSuccessModal from './SignupSuccessModal';
import Link from 'next/link';

export default function MultiStepSignupForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userName, setUserName] = useState('');

  // Données des étapes
  const [stepOneData, setStepOneData] = useState<SignupStepOneData>({
    nom: '',
    post_nom: '',
    prenom: '',
    sexe: 'M',
  });

  const [stepTwoData, setStepTwoData] = useState<SignupStepTwoData>({
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
  });

  const { signup, error, isLoading, clearError } = useAuthActions();
  const router = useRouter();

  // Gestion des changements - Étape 1
  const handleStepOneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStepOneData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (error) clearError();
  };

  // Gestion des changements - Étape 2
  const handleStepTwoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStepTwoData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (error) clearError();
  };

  // Validation étape 1
  const validateStepOne = (): boolean => {
    return !!(stepOneData.nom && stepOneData.post_nom && stepOneData.prenom && stepOneData.sexe);
  };

  // Validation étape 2
  const validateStepTwo = (): boolean => {
    if (!stepTwoData.email || !stepTwoData.password || !stepTwoData.confirmPassword) {
      return false;
    }
    
    if (stepTwoData.password !== stepTwoData.confirmPassword) {
      return false;
    }
    
    return true;
  };

  // Navigation entre étapes
  const nextStep = () => {
    if (currentStep === 1 && validateStepOne()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Soumission finale
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStepTwo()) {
      return;
    }

    try {
      const signupData = {
        ...stepOneData,
        ...stepTwoData,
        role: 'titulaire', // Rôle par défaut
      };

      const result = await signup(signupData);
      console.log("result", result);
      if (result._id) {
        setUserName(`${stepOneData.prenom} ${stepOneData.nom}`);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Créer un compte
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Étape {currentStep} sur 2 - {currentStep === 1 ? 'Informations personnelles' : 'Informations de connexion et grade'}
        </p>
      </div>

      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        {/* Étape 1: Informations personnelles */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="nom">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nom"
                name="nom"
                type="text"
                defaultValue={stepOneData.nom}
                onChange={handleStepOneChange}
                placeholder="Votre nom de famille"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="post_nom">
                Post-nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="post_nom"
                name="post_nom"
                type="text"
                defaultValue={stepOneData.post_nom}
                onChange={handleStepOneChange}
                placeholder="Votre post-nom"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="prenom">
                Prénom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prenom"
                name="prenom"
                type="text"
                defaultValue={stepOneData.prenom}
                onChange={handleStepOneChange}
                placeholder="Votre prénom"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="sexe">
                Sexe <span className="text-red-500">*</span>
              </Label>
              <select
                id="sexe"
                name="sexe"
                value={stepOneData.sexe}
                onChange={handleStepOneChange}
                disabled={isLoading}
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            <button
              type="button"
              onClick={nextStep}
              disabled={!validateStepOne() || isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Suivant
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Étape 2: Informations de connexion */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={stepTwoData.email}
                onChange={handleStepTwoChange}
                placeholder="votre@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="grade">
                Grade
              </Label>
              <Input
                id="grade"
                name="grade"
                type="text"
                defaultValue={stepTwoData.grade}
                onChange={handleStepTwoChange}
                placeholder="Votre grade (optionnel)"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password">
                Mot de passe <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  defaultValue={stepTwoData.password}
                  onChange={handleStepTwoChange}
                  placeholder="Votre mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeCloseIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  defaultValue={stepTwoData.confirmPassword}
                  onChange={handleStepTwoChange}
                  placeholder="Confirmez votre mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeCloseIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {stepTwoData.password && stepTwoData.confirmPassword && stepTwoData.password !== stepTwoData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Précédent
              </button>
              <button
                type="submit"
                disabled={!validateStepTwo() || isLoading}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Lien vers connexion */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Déjà un compte ?{' '}
          <Link
            href="/signin"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Se connecter
          </Link>
        </p>
      </div>

      {/* Modal de succès */}
      <SignupSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userName={userName}
      />
    </div>
  );
}
