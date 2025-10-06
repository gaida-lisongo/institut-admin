"use client";
import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { useUserStore } from "@/stores/userStore";
import { validateAndHashNewPassword } from "@/utils/password";

export default function UserInfoCard() {
  const { currentUser, updateUser } = useUserStore();
  const [user, setUser] = useState(currentUser || {
    _id: '',
    nom: '',
    post_nom: '',
    prenom: '',
    email: '',
    grade: '',
    sexe: 'M' as 'M' | 'F',
    role: ''
  });

  // Synchroniser l'état local avec currentUser
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);
  const [data, setData] = useState<{
    password: string;
    newPassword: string;
    confirmNewPassword: string;
  }>({
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen, openModal, closeModal } = useModal();
  
  const handleSave = async () => {
    if (!currentUser?._id || !user) {
      setMessage('❌ Erreur: Utilisateur non trouvé');
      return;
    }

    // Variables pour le mot de passe crypté
    let hashedNewPassword: string | undefined;

    // Validation et cryptage des mots de passe si fournis
    if (data.newPassword || data.confirmNewPassword || data.password) {
      if (!data.password) {
        setMessage('❌ Veuillez saisir votre ancien mot de passe');
        return;
      }
      if (!data.newPassword) {
        setMessage('❌ Veuillez saisir un nouveau mot de passe');
        return;
      }
      if (data.newPassword !== data.confirmNewPassword) {
        setMessage('❌ Les nouveaux mots de passe ne correspondent pas');
        return;
      }

      // Vérifier et crypter le nouveau mot de passe
      if (!currentUser.password) {
        setMessage('❌ Erreur: Mot de passe utilisateur non disponible');
        return;
      }

      const passwordValidation = validateAndHashNewPassword(
        data.password,
        currentUser.password,
        data.newPassword
      );

      console.log("passwordValidation :", passwordValidation);

      if (!passwordValidation.success) {
        setMessage(`❌ ${passwordValidation.error}`);
        return;
      }

      hashedNewPassword = passwordValidation.hashedPassword;
    }

    setIsLoading(true);
    setMessage('⏳ Mise à jour en cours...');

    try {
      // Préparer les données à envoyer
      const updateData: any = {
        nom: user.nom,
        post_nom: user.post_nom,
        prenom: user.prenom,
        email: user.email,
        grade: user.grade,
        sexe: user.sexe,
      };

      // Ajouter le mot de passe crypté si fourni
      if (hashedNewPassword) {
        updateData.password = hashedNewPassword;
      }

      // Appeler la fonction updateUser du store
      const result = await updateUser(currentUser._id, updateData);

      if (result) {
        setMessage('✅ Informations mises à jour avec succès!');
        // Réinitialiser les champs de mot de passe
        setData({
          password: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        // Fermer le modal après 2 secondes
        setTimeout(() => {
          closeModal();
          setMessage('');
        }, 2000);
      } else {
        setMessage(`❌ Erreur: ${result.error || result.message || 'Échec de la mise à jour'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setMessage('❌ Erreur réseau lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  console.log("User data :", currentUser);
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informations personnelles
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser?.nom}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Post-nom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser?.post_nom}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Prenom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser?.prenom}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser?.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Grade académique
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser?.grade}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
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
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Modifier
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Modifier les informations personnelles
            </h4>
            {message && (
              <p className={`mb-6 text-sm lg:mb-7 ${
                message.includes('✅') ? 'text-green-600 dark:text-green-400' :
                message.includes('❌') ? 'text-red-600 dark:text-red-400' :
                'text-blue-600 dark:text-blue-400'
              }`}>
                {message}
              </p>
            )}
          </div>
          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Informations personnelles
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Nom</Label>
                    <input
                      type="text"
                      value={user.nom}
                      onChange={(e) => setUser({ ...user, nom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label>Post-nom</Label>
                    <input 
                      type="text" 
                      value={user.post_nom} 
                      onChange={(e) => setUser({ ...user, post_nom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label>Prenom</Label>
                    <input
                      type="text"
                      value={user.prenom}
                      onChange={(e) => setUser({ ...user, prenom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label>Sexe</Label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      value={user.sexe}
                      onChange={(e) => setUser({ ...user, sexe: e.target.value as 'M' | 'F' })}
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Sécurité
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <input 
                      type="email" 
                      value={user.email} 
                      onChange={(e) => setUser({ ...user, email: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Grade académique</Label>
                    <input 
                      type="text" 
                      value={user.grade} 
                      onChange={(e) => setUser({ ...user, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Ancien mot de passe</Label>
                    <input 
                      type="password" 
                      value={data.password} 
                      onChange={(e) => setData({ ...data, password: e.target.value })} 
                      placeholder="Saisissez votre mot de passe actuel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Nouveau mot de passe</Label>
                    <input 
                      type="password" 
                      value={data.newPassword} 
                      onChange={(e) => setData({ ...data, newPassword: e.target.value })} 
                      placeholder="Saisissez un nouveau mot de passe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Confirmer le nouveau mot de passe</Label>
                    <input 
                      type="password" 
                      value={data.confirmNewPassword} 
                      onChange={(e) => setData({ ...data, confirmNewPassword: e.target.value })} 
                      placeholder="Confirmez le nouveau mot de passe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <button 
                type="button"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                onClick={closeModal} 
                disabled={isLoading}
              >
                Fermer
              </button>
              <button 
                type="button"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                onClick={handleSave} 
                disabled={isLoading}
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
