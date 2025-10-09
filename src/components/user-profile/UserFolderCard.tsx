"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { useCurrentUser } from "@/stores/personnelStore";
import { Personnel, UpdatePersonnelData } from "@/types/personnel";

export default function UserFolderCard() {
  const { currentUser, updateCurrentUser, isLoading } = useCurrentUser();
  const [formData, setFormData] = useState<Partial<Personnel>>({});

  useEffect(() => {
    if (currentUser) {
      setFormData(currentUser);
    }
  }, [currentUser]);

  
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Dossier Académique
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Niveau d'étude
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formData?.niveau}
                </p>
              </div>

              <div>
              </div>

              {
                formData?.documents && formData?.documents.map(document => {
                    return (
                        <div key={document._id}>
                          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                            {document?.designation}
                          </p>
                          <a 
                            className="text-sm font-medium text-gray-800 dark:text-white/90"
                            target="_blank"
                            href={document?.url}
                          >
                            Fichier : {document?.type}
                          </a>
                        </div>
                    )
                })
              }

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
