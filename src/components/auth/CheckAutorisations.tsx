'use client';

import { useAuth } from "@/stores/personnelStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Autorisation } from "@/types/personnel";

const typesAut: string[] = [
    'DG',
    'SGACAD',
    'SGR',
    'SGAD',
    'AB'
];

const CheckAutorisations = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const [hasRedirected, setHasRedirected] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Éviter les redirections multiples
        if (hasRedirected || !currentUser) return;
        
        // Filtrer les autorisations valides
        const autorisationsValides = currentUser.autorisations?.filter(
            (autorisation: Autorisation) => 
                typesAut.includes(autorisation.type) && autorisation.action === true
        ) || [];

        if (autorisationsValides.length > 0) {
            // Stocker les autorisations dans localStorage
            localStorage.setItem("autorisations", JSON.stringify(autorisationsValides));
            
            // Marquer comme redirigé
            setHasRedirected(true);
            
            // Rediriger après un court délai pour s'assurer que le localStorage est bien écrit
            setTimeout(() => {
                router.push("/");
            }, 100);
        } else {
            console.warn("⚠️ Aucune autorisation valide trouvée pour cet utilisateur");
            // Rediriger vers une page d'erreur ou d'accès refusé
            localStorage.removeItem("autorisations");
            setTimeout(() => {
                router.push("/unauthorized");
            }, 100);
        }
    }, [currentUser, hasRedirected, router]);

    // Afficher un loader pendant la vérification
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Vérification des autorisations...</p>
            </div>
        </div>
    );
};

export default CheckAutorisations;
