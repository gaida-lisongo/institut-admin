"use client";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import useAuthStore from "@/stores/authStore";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, updateUser } = useAuthStore();

  // Références pour les champs du formulaire
  const nomRef = React.useRef<HTMLInputElement>(null);
  const postNomRef = React.useRef<HTMLInputElement>(null);
  const prenomRef = React.useRef<HTMLInputElement>(null);
  const sexeRef = React.useRef<HTMLSelectElement>(null);
  const nationaliteRef = React.useRef<HTMLInputElement>(null);
  const lieuNaissanceRef = React.useRef<HTMLInputElement>(null);
  const dateNaissanceRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    console.log("User data from store:", user);
  }, [user]);

  // Fonction pour réinitialiser le formulaire avec les données utilisateur
  const resetForm = () => {
    if (user && isOpen) {
      if (nomRef.current) nomRef.current.value = user.nom || '';
      if (postNomRef.current) postNomRef.current.value = user.post_nom || '';
      if (prenomRef.current) prenomRef.current.value = user.prenom || '';
      if (sexeRef.current) sexeRef.current.value = user.sexe || '';
      if (nationaliteRef.current) nationaliteRef.current.value = user.nationalite || '';
      if (lieuNaissanceRef.current) lieuNaissanceRef.current.value = user.lieu_naissance || '';
      if (dateNaissanceRef.current && user.date_naissance) {
        dateNaissanceRef.current.value = new Date(user.date_naissance).toISOString().split('T')[0];
      }
    }
  };

  React.useEffect(() => {
    resetForm();
  }, [isOpen, user]);

  // Fonction pour formater la date de naissance
  const formatDateNaissance = (dateString: string | Date | undefined): string => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) return "N/A";
      
      // Format français : DD/MM/YYYY
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return "N/A";
    }
  };

  const handleSave = async () => {
    try {
      // Récupérer les valeurs des champs
      const updateData: any = {
        nom: nomRef.current?.value || '',
        post_nom: postNomRef.current?.value || '',
        prenom: prenomRef.current?.value || '',
        sexe: sexeRef.current?.value || '',
        nationalite: nationaliteRef.current?.value || '',
        lieu_naissance: lieuNaissanceRef.current?.value || '',
      };

      // Convertir la date si elle est fournie
      if (dateNaissanceRef.current?.value) {
        updateData.date_naissance = new Date(dateNaissanceRef.current.value);
      }

      // Mettre à jour l'utilisateur
      await updateUser(updateData);
      
      console.log("Informations personnelles mises à jour avec succès");
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour des informations. Veuillez réessayer.");
    }
  };
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informations Personnelles
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.nom ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Post-Nom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.post_nom ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Prenom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.prenom ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Sexe
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.sexe ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nationalité
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.nationalite ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Lieu et Date de Naissance
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.lieu_naissance ?? "N/A"}, {formatDateNaissance(user?.date_naissance)}
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
          Modifier les Infos Personnelles
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Modifier les Informations Personnelles
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour vos informations personnelles.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Informations Personnelles
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Nom</Label>
                    <input
                      ref={nomRef}
                      type="text"
                      defaultValue={user?.nom || ''}
                      placeholder="Entrez votre nom"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label>Post-Nom</Label>
                    <input
                      ref={postNomRef}
                      type="text" 
                      defaultValue={user?.post_nom || ''}
                      placeholder="Entrez votre post-nom"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label>Prénom</Label>
                    <input
                      ref={prenomRef}
                      type="text"
                      defaultValue={user?.prenom || ''}
                      placeholder="Entrez votre prénom"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label>Sexe</Label>
                    <select
                      ref={sexeRef}
                      defaultValue={user?.sexe || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>

                  <div>
                    <Label>Nationalité</Label>
                    <input
                      ref={nationaliteRef}
                      type="text"
                      defaultValue={user?.nationalite || ''}
                      placeholder="Entrez votre nationalité"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label>Lieu de Naissance</Label>
                    <input
                      ref={lieuNaissanceRef}
                      type="text"
                      defaultValue={user?.lieu_naissance || ''}
                      placeholder="Entrez votre lieu de naissance"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Date de Naissance</Label>
                    <input
                      ref={dateNaissanceRef}
                      type="date"
                      defaultValue={user?.date_naissance ? new Date(user.date_naissance).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
