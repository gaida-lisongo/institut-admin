import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-screen bg-white dark:bg-gray-900">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-full">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 lg:flex items-center justify-center hidden relative overflow-hidden">
            {/* Image de fond avec overlay */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Image du professeur enseignant */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <Image
                src="https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Professeur enseignant à des étudiants"
                fill
                className="object-fill"
                priority
              />
              
              {/* Overlay avec texte */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-16">
                <div className="text-center text-white max-w-md px-6">
                  <h2 className="text-2xl font-bold mb-2">Institut d'Administration</h2>
                  <p className="text-white/90 text-sm">
                    Plateforme de gestion éducative moderne pour l'excellence académique
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div> */}
        </div>
      </ThemeProvider>
    </div>
  );
}
