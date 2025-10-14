"use client";

import { useEtablissementStore } from "@/stores/etablissementStore";
import { useFraisStore } from "@/stores/fraisStore";
import { useAnneeStore } from "@/stores/anneeStore";
import { PaiementsProvider } from "@/contexts/PaiementsContext";
import { PaiementsBanner } from "@/components/paiements/PaiementsBanner";
import { Frais } from "@/types/frais";
import { Annee } from "@/types/annee";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

const LayoutPaiements = ({children}: {children: React.ReactNode}) => {
    const params = useParams();
    const etablissementId = params.slug as string;

    const { fetchEtablissementById, selectedEtablissement, isLoading: isLoadingEtablissement } = useEtablissementStore();
    const { frais, loadFraisByEtab, isLoading: isLoadingFrais } = useFraisStore();
    const { annees, fetchAnnees, loading: isLoadingAnnees } = useAnneeStore();
    
    const [selectedFrais, setSelectedFrais] = useState<Frais | null>(null);
    const [selectedAnnee, setSelectedAnnee] = useState<Annee | null>(null);

    // Chargement initial des données
    useEffect(() => {
        fetchAnnees();
    }, []);

    useEffect(() => {
        if (etablissementId) {
            fetchEtablissementById(etablissementId);
        }
    }, [etablissementId]);

    useEffect(() => {
        if (selectedEtablissement) {
            console.log("Current selectedEtablissement: ", selectedEtablissement);
            
            const loadFraisSequentially = async () => {
                try {
                    // Charger d'abord les frais spécifiques à la catégorie de l'établissement
                    await loadFraisByEtab(selectedEtablissement.categorie);
                    // Puis charger tous les frais pour avoir une liste complète
                    await loadFraisByEtab('tous');
                } catch (error) {
                    console.error('Erreur lors du chargement des frais:', error);
                }
            };
            
            loadFraisSequentially();
        }
    }, [selectedEtablissement]);

    // Sélection automatique de l'année courante
    useEffect(() => {
        if (annees.length > 0 && !selectedAnnee) {
            // Chercher d'abord une année active
            let currentAnnee = annees.find(annee => annee.statut === 'active');
            
            // Fallback sur la première année si aucune année active
            if (!currentAnnee) {
                currentAnnee = annees[0];
            }
            
            console.log('Années disponibles:', annees);
            console.log('Année sélectionnée automatiquement:', currentAnnee);
            setSelectedAnnee(currentAnnee);
        }
    }, [annees, selectedAnnee]);

    // Filtrage des frais selon la catégorie de l'établissement
    const filteredFrais = useMemo(() => {
        if (!selectedEtablissement || !frais) return [];
        console.log(selectedEtablissement.categorie);
        console.log(frais);
        return frais.filter(f => 
            f.etabs.includes(selectedEtablissement.categorie) || f.etabs.includes('tous')
        );
    }, [frais, selectedEtablissement]);

    const isLoading = isLoadingEtablissement || isLoadingFrais || isLoadingAnnees;

    // Valeur du contexte
    const contextValue = {
        etablissement: selectedEtablissement,
        selectedFrais,
        selectedAnnee,
        allFrais: filteredFrais,
        allAnnees: annees,
        setSelectedFrais,
        setSelectedAnnee,
        isLoading
    };
    
    return (
        <PaiementsProvider value={contextValue}>
            <div className="space-y-6">
                <PaiementsBanner
                    etablissement={selectedEtablissement}
                    allFrais={filteredFrais}
                    allAnnees={annees}
                    selectedFrais={selectedFrais}
                    selectedAnnee={selectedAnnee}
                    onFraisChange={setSelectedFrais}
                    onAnneeChange={setSelectedAnnee}
                    isLoading={isLoading}
                />
                {children}
            </div>
        </PaiementsProvider>
    )
}

export default LayoutPaiements
