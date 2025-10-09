"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/personnelStore";

export default function UserMetaCard() {
  const router = useRouter();
  const { currentUser, logout, initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleLogout = () => {
    logout();
    router.push("/signin");
  };
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {currentUser?.photo ? (
                <Image
                  width={80}
                  height={80}
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
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {currentUser?.nom} {currentUser?.post_nom} {currentUser?.prenom}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser?.matricule}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Grade: {currentUser?.grade}
                </p>
              </div>
            </div>
            
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <polyline
                points="16,17 21,12 16,7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Se déconnecter
          </button>
        </div>
      </div>
    </>
  );
}
