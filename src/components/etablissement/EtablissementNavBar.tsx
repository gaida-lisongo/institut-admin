'use client';

import { useEtablissementStore } from "@/stores/etablissementStore";
import { useEffect, useState } from "react";
import { EtablissementPopulated } from "@/types/etablissement";
import { useAuth } from "@/stores/personnelStore";
import { Building2, Users, GraduationCap, ChevronDown, Check, DockIcon } from "lucide-react";

interface EtablissementNavBarProps {
    etablissement: EtablissementPopulated | null;
    setEtablissement: (etablissement: EtablissementPopulated | null) => void;
}

const EtablissementNavBar = ({
    etablissement,
    setEtablissement
}: EtablissementNavBarProps) => {
    const [data, setData] = useState<EtablissementPopulated[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { etablissements, fetchEtablissements } = useEtablissementStore();
    const { currentUser } = useAuth();

    useEffect(() => {
        const loadEtablissements = async () => {
            setIsLoading(true);
            await fetchEtablissements();
            setIsLoading(false);
        };
        loadEtablissements();
    }, [fetchEtablissements]);
    
    useEffect(() => {
        let etabsData: EtablissementPopulated[] = [];
        etablissements.forEach((etablissement: EtablissementPopulated) => {
            if (!etablissement.coge) {
                return;
            }
            const isMember = etablissement.coge.find((member: any) => member.membreId?._id === currentUser?._id);
            if (isMember) {
                etabsData.push(etablissement);
            }
        });
        setData(etabsData);
    }, [etablissements, currentUser]);

    useEffect(() => {
        if (data.length > 0 && !etablissement) {
            setEtablissement(data[0]);
        }
    }, [data, etablissement, setEtablissement]);

    const getEtablissementStats = (etab: EtablissementPopulated) => {
        // Vous pouvez adapter ces calculs selon votre structure de données
        const totalMembers = etab.coge?.length || 0;
        const totalStudents = 0; // À adapter selon vos données
        const totalClasses = 0; // À adapter selon vos données
        
        return { totalMembers, totalStudents, totalClasses };
    };

    if (isLoading) {
        return (
            <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Informations de l'établissement sélectionné */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white font-bold text-lg shadow-lg">
                            {/* Logo Etablissement */}
                            <img src={etablissement?.logo || '/placeholder-logo.png'} alt="Logo Etablissement" className="w-12 h-12 rounded-lg" />
                        </div>
                        
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                {etablissement?.designation || 'Aucun établissement sélectionné'}
                            </h1>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center">
                                    <Building2 className="w-4 h-4 mr-1" />
                                    {etablissement?.sigle || 'N/A'}
                                </span>
                                {etablissement && (
                                    <>
                                        <span className="flex items-center">
                                            <DockIcon className="w-4 h-4 mr-1" />
                                            {etablissement?.categorie?.toString().toUpperCase() || 'N/A'}
                                        </span>
                                        <span className="flex items-center">
                                            <GraduationCap className="w-4 h-4 mr-1" />
                                            {etablissement?.reference || 'N/A'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sélecteur d'établissement */}
                    <div className="flex items-center space-x-4">
                        {data.length > 1 && (
                            <div className="relative">
                                <select
                                    value={etablissement?._id || ''}
                                    onChange={(e) => {
                                        const selectedEtab = data.find(etab => etab._id === e.target.value);
                                        if (selectedEtab) setEtablissement(selectedEtab);
                                    }}
                                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
                                >
                                    {data.map((etab: EtablissementPopulated) => (
                                        <option key={etab._id} value={etab._id}>
                                            {etab.designation} ({etab.sigle})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Barre du comité de gestion (coge) */}
                {etablissement && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className={`grid grid-cols-1 md:grid-cols-${etablissement.coge?.length || 1} gap-${etablissement.coge?.length || 1}`}>
                            {etablissement.coge?.map((member: any) => (
                                <div key={member._id} className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {member?.role?.toString().toUpperCase()}: {member.membreId?.nom} {member.membreId?.post_nom}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EtablissementNavBar;
