'use client';

import { useEtablissementStore } from "@/stores/etablissementStore";
import { useEffect, useState } from "react";
import { EtablissementPopulated } from "@/types/etablissement";
import { useAuth } from "@/stores/personnelStore";

const LayoutEtabsNavigation = ({
    etablissement,
    setEtablissement
}: {
    etablissement: EtablissementPopulated | null;
    setEtablissement: (etablissement: EtablissementPopulated | null) => void;
}) => {
    const [data, setData] = useState<EtablissementPopulated[]>([]);
    const { etablissements, fetchEtablissements } = useEtablissementStore();
    const autorisations = localStorage.getItem('autorisations');
    const autorisationsParsed = JSON.parse(autorisations || '[]');
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchEtablissements();
    }, []);
    
    useEffect(() => {
        let etabsData = [];
        etablissements.map((etablissement: EtablissementPopulated) => {
            if(!etablissement.coge){
                return;
            }
            const isMember = etablissement.coge.find((member : any) => member.membreId?._id === currentUser?._id);
            if(isMember){
                etabsData.push(etablissement);
            }
        });
        setData(etabsData);
    }, [etablissements]);

    useEffect(() => {
        if(data.length > 0){
            setEtablissement(data[0]);
        }
    }, [data]);
    

    return (
        <div className="flex flex-col gap-4">
            {data.map((etablissement: EtablissementPopulated) => (
                <button key={etablissement._id} onClick={() => setEtablissement(etablissement)}>
                    <h1>{etablissement.sigle}</h1>
                </button>
            ))}
        </div>
    );
};

export default LayoutEtabsNavigation;
