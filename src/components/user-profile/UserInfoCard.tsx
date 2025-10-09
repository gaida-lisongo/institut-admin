"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Personnel, UpdatePersonnelData } from "@/types/personnel";
import { useCurrentUser } from "@/stores/personnelStore";
import BlobManager from "@/services/BlobManager";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { currentUser, updateCurrentUser, updateCurrentUserPhoto, isLoading } = useCurrentUser();
  const [formData, setFormData] = useState<Partial<Personnel>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      setFormData(currentUser);
    }
  }, [currentUser]);
  const handleInputChange = (field: keyof Personnel, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 5MB');
        return;
      }

      setPhotoFile(file);
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile || !currentUser) return;

    setIsUploadingPhoto(true);
    try {
      const result = await BlobManager.createBlob(photoFile, {
        userId: currentUser._id,
        type: 'profile-photo'
      });

      if (result.url) {
        // Mettre à jour la photo dans le store
        await updateCurrentUserPhoto(result.url);
        
        // Mettre à jour formData pour le formulaire
        setFormData(prev => ({ ...prev, photo: result.url }));
        
        // Réinitialiser les états de photo
        setPhotoFile(null);
        setPhotoPreview(null);
        
        alert('Photo mise à jour avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser || !formData) return;
    
    try {
      // Extract _id and create update data without _id
      const { _id, ...updateData } = formData;
      
      // Handle save logic here using the store
      await updateCurrentUser(updateData as UpdatePersonnelData);
      
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour des informations');
    }
  };

  const formatDateForInput = (date: string | Date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toISOString().split('T')[0];
  };

  const renderCustomLoader = () => (
    <div className="animate-spin h-6 w-6 mx-auto my-6 text-gray-500 dark:text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
    </div>
  );

  const parseToFrenchDate = (date: string | Date) => {
    const dateTime = date instanceof Date ? date : new Date(date);
    const day = dateTime.getDate();
    const month = dateTime.getMonth() + 1;
    const year = dateTime.getFullYear();

    return `${day}/${month}/${year}`;
  };

  if (!currentUser) {
    return (
      <div className="animate-spin h-6 w-6 mx-auto my-6 text-gray-500 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
      </div>
    );
  }
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Identités
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
                Nationalité
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser?.nationalite}
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
                Lieu de naissance
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser?.lieu_naissance}
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
                Date de naissance
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser?.date_naissance ? parseToFrenchDate(currentUser?.date_naissance) : ""}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Sexe
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {currentUser?.sexe}
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
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour vos informations pour maintenir votre profil à jour.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              {/* Section Photo de profil */}
              <div className="mb-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Photo de profil
                </h5>
                
                <div className="flex flex-col items-center gap-4">
                  {/* Affichage de la photo actuelle ou preview */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : currentUser?.photo ? (
                        <img 
                          src={currentUser.photo} 
                          alt="Photo de profil" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // En cas d'erreur de chargement, masquer l'image et afficher les initiales
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="text-2xl font-semibold text-gray-400 dark:text-gray-500">${currentUser?.nom?.charAt(0) || ''}${currentUser?.prenom?.charAt(0) || ''}</div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="text-2xl font-semibold text-gray-400 dark:text-gray-500">
                          {currentUser?.nom?.charAt(0)}{currentUser?.prenom?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Input file et boutons */}
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                    />
                    
                    {photoFile && (
                      <Button
                        size="sm"
                        onClick={uploadPhoto}
                        disabled={isUploadingPhoto}
                        className="w-full"
                      >
                        {isUploadingPhoto ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Upload...
                          </div>
                        ) : (
                          'Mettre à jour la photo'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Informations personnelles
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nom</Label>
                    <Input 
                      type="text" 
                      defaultValue={formData.nom || ''}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Post-nom</Label>
                    <Input 
                      type="text" 
                      defaultValue={formData.post_nom || ''}
                      onChange={(e) => handleInputChange('post_nom', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Prénom</Label>
                    <Input 
                      type="text" 
                      defaultValue={formData.prenom || ''}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Matricule</Label>
                    <Input 
                      type="text" 
                      defaultValue={formData.matricule || ''}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      defaultValue={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Téléphone</Label>
                    <Input 
                      type="tel" 
                      defaultValue={formData.telephone || ''}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Sexe</Label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      value={formData.sexe || ''}
                      onChange={(e) => handleInputChange('sexe', e.target.value as 'M' | 'F')}
                    >
                      <option value="">Sélectionner</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nationalité</Label>
                    <Input 
                      type="text" 
                      defaultValue={formData.nationalite || ''}
                      onChange={(e) => handleInputChange('nationalite', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Lieu de naissance</Label>
                    <Input 
                      type="text" 
                      defaultValue={formData.lieu_naissance || ''}
                      onChange={(e) => handleInputChange('lieu_naissance', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Date de naissance</Label>
                    <Input 
                      type="date" 
                      defaultValue={formatDateForInput(formData.date_naissance || '')}
                      onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Adresse</Label>
                    <Input 
                      type="text" 
                      defaultValue={formData.adresse || ''}
                      onChange={(e) => handleInputChange('adresse', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={isLoading}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  'Sauvegarder'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
