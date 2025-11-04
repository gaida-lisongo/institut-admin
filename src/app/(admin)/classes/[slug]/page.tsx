"use client";
import CycleList from "@/components/cycles/CycleList";
import { Classe, Cycle } from "@/services/CycleService";
import { useCycleStore } from "@/stores/cycleStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAnneeStore } from "@/stores/anneeStore";
import { Annee } from "@/services/AnneeService";
import ClasseDetail from "@/components/cycles/ClasseDetail";

const ClassesPage = () => {
    const { cycles, loading, error, fetchCyclesBySection } = useCycleStore();
    const { annees, fetchAnnees } = useAnneeStore();
    const [anneeId, setAnneeId] = useState<string>('');
    const [sectionId, setSectionId] = useState<string>('');
    const [annee, setAnnee] = useState<Annee | null>(null);
    const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
    const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
    const [viewer, setViewer] = useState<'cycles' | 'classe'>('cycles');
    const params = useParams();
    const slug = params.slug;

    useEffect(() => {
        if (!slug) return;
        const [annee, section] = slug.toString().split('-');
        setAnneeId(annee);
        setSectionId(section);
        fetchAnnees();
    }, [slug]);

    useEffect(() => {
        if (sectionId) {
            fetchCyclesBySection(sectionId);
        }
    }, [sectionId]);

    useEffect(() => {
        if (annees && anneeId) {
            console.log("Annees: ", annees);
            console.log("Annee ID: ", anneeId);
            const currentAnnee : Annee | undefined = annees.find((annee) => annee._id === anneeId);
            console.log("Current Annee: ", currentAnnee);
            if (currentAnnee) {
                setAnnee(currentAnnee);
            }
        }
    }, [annees]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const editCycle = (cycle: Cycle) => {
        console.log("Current cycle: ", cycle);
    }

    const handleClasseClick = (classe: Classe, cycle: Cycle) => {
        console.log("Current classe: ", classe);
        setSelectedClasse(classe);
        setSelectedCycle(cycle);
        setViewer('classe');
    }

    const renderCycles = () => {
        if (cycles.length === 0 || !annee) {
            return <div>Aucun cycle trouvé</div>;
        }
        
        return cycles.map((cycle) => (
            <CycleList 
                key={cycle._id} 
                cycles={cycles} 
                loading={loading} 
                onEdit={editCycle} 
                sectionId={sectionId} 
                annee={annee}
                onClasseClick={handleClasseClick}
            />
        ));
    }

    const renderClasse = ({
        cycle,
        classe,
        annee
    }: {
        cycle: Cycle;
        classe: Classe;
        annee: Annee;
    }) => {
        if (!classe) {
            return <div>Aucune classe trouvée</div>;
        }
        
        return <ClasseDetail cycle={cycle} classe={classe} annee={annee} sectionId={sectionId} onBack={() => setViewer('cycles')} />
    }
    
    return (
        <div>
            {viewer === 'cycles' ? renderCycles() : renderClasse({ cycle: selectedCycle!, classe: selectedClasse!, annee: annee! })}
        </div>
    )
}

export default ClassesPage;
