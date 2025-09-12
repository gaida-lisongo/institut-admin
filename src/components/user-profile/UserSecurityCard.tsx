"use client";
import React from "react";
import Image from "next/image";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import useAuthStore from "@/stores/authStore";
import { PasswordUtils } from "@/utils/passwordUtils";


export default function UserSecurityCard() {
  const { user, updateUser } = useAuthStore();
  const { isOpen, openModal, closeModal } = useModal();
  
  // Références pour les champs du formulaire
  const currentPasswordRef = React.useRef<HTMLInputElement>(null);
  const newPasswordRef = React.useRef<HTMLInputElement>(null);
  const confirmPasswordRef = React.useRef<HTMLInputElement>(null);
  
  // États pour la gestion du formulaire
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  React.useEffect(() => {
    console.log("User data from store:", user);
  }, [user]);

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    if (currentPasswordRef.current) currentPasswordRef.current.value = '';
    if (newPasswordRef.current) newPasswordRef.current.value = '';
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handlePasswordChange = async () => {
    if (!user) {
      alert('Aucun utilisateur connecté');
      return;
    }

    const currentPassword = currentPasswordRef.current?.value || '';
    const newPassword = newPasswordRef.current?.value || '';
    const confirmPassword = confirmPasswordRef.current?.value || '';

    // Validations
    if (!currentPassword) {
      alert('Veuillez saisir votre mot de passe actuel');
      return;
    }

    if (!newPassword) {
      alert('Veuillez saisir un nouveau mot de passe');
      return;
    }

    if (newPassword.length < 6) {
      alert('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('La confirmation du mot de passe ne correspond pas');
      return;
    }

    if (currentPassword === newPassword) {
      alert('Le nouveau mot de passe doit être différent de l\'ancien');
      return;
    }

    setIsSubmitting(true);

    try {
      // Vérifier si le mot de passe actuel est correct
      // On crypte le mot de passe saisi et on le compare avec celui stocké
      const hashedCurrentPassword = PasswordUtils.hashPassword(currentPassword);
      console.log("Hashed current password:", hashedCurrentPassword); 
      console.log("User's stored secure password:", user.secure);
      if (hashedCurrentPassword !== user.secure) {
        alert('Le mot de passe actuel est incorrect');
        return;
      }

      // Mettre à jour avec le nouveau mot de passe
      const userUpdated = {
        ...user,
        secure: PasswordUtils.hashPassword(newPassword)
      }
      console.log("User object to be updated:", newPassword);
      console.log("User object to be updated:", userUpdated);
      await updateUser(userUpdated);

      alert('Mot de passe mis à jour avec succès !');
      closeModal();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      alert('Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="relative group">
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <Image
                  width={80}
                  height={80}
                  src={user?.photo || "/images/avatar/avatar-1.jpg"}
                  alt="user"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.nom ?? "Sans Nom"} {user?.post_nom ?? "Sans post-nom"} {user?.prenom ?? "Sans Prénom"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Matricule: {user?.matricule ? user.matricule : "S/M"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Solde: {user?.solde ? (user.solde).toFixed(2) : "S/0"} CDF
                </p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <button
                onClick={openModal}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto transition-colors duration-200 disabled:opacity-50"
              >
                <svg
                  className="fill-current"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 1C10.895 1 10 1.895 10 3s.895 2 2 2 2-.895 2-2-.895-2-2-2zm0 6c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 7c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm6 0c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z"
                    fill="currentColor"
                  />
                </svg>
                {isSubmitting ? 'Mise à jour...' : 'Modifier son Mot de Passe'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
          <div className="mb-6">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Modifier le Mot de Passe
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pour sécuriser votre compte, veuillez saisir votre mot de passe actuel puis votre nouveau mot de passe.
            </p>
          </div>

          <form 
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordChange();
            }}
          >
            {/* Mot de passe actuel */}
            <div>
              <Label>Mot de passe actuel *</Label>
              <div className="relative">
                <input
                  ref={currentPasswordRef}
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Saisissez votre mot de passe actuel"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <Label>Nouveau mot de passe *</Label>
              <div className="relative">
                <input
                  ref={newPasswordRef}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Saisissez votre nouveau mot de passe"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Minimum 6 caractères
              </p>
            </div>

            {/* Confirmation du nouveau mot de passe */}
            <div>
              <Label>Confirmer le nouveau mot de passe *</Label>
              <div className="relative">
                <input
                  ref={confirmPasswordRef}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre nouveau mot de passe"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Mise à jour...' : 'Modifier le mot de passe'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
