"use client";
import React from "react";
import Image from "next/image";
import useAuthStore from "@/stores/authStore";
import BlobManager from "@/services/BlobManager";


export default function UserMetaCard() {
  const { user, updateUser } = useAuthStore();
  const [isUpdatingPhoto, setIsUpdatingPhoto] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    console.log("User data from store:", user);
  }, [user]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('La taille du fichier ne doit pas dépasser 5MB.');
      return;
    }

    setIsUpdatingPhoto(true);

    try {
      // Upload du fichier
      const uploadResult = await BlobManager.createBlob(file, {
        userId: user._id,
        type: 'profile-photo'
      });

      // Mise à jour de l'utilisateur avec la nouvelle photo
      await updateUser({
        photo: uploadResult.url || uploadResult.pathname
      });

      console.log('Photo de profil mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo:', error);
      alert('Erreur lors de la mise à jour de la photo. Veuillez réessayer.');
    } finally {
      setIsUpdatingPhoto(false);
      // Reset l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="relative group">
              <div 
                className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 cursor-pointer transition-all duration-200 hover:border-blue-500 hover:shadow-lg"
                onClick={handlePhotoClick}
              >
                <Image
                  width={80}
                  height={80}
                  src={user?.photo || "/images/avatar/avatar-1.jpg"}
                  alt="user"
                  className="object-cover w-full h-full"
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={isUpdatingPhoto}
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.matricule ?? "_matricule"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Titre: {user?.titre ? user.titre : "Titre"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Grade: {user?.grade ? user.grade : "Grade"}
                </p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <button
                onClick={handlePhotoClick}
                disabled={isUpdatingPhoto}
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    fill="currentColor"
                  />
                </svg>
                {isUpdatingPhoto ? 'Mise à jour...' : 'Changer la photo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
