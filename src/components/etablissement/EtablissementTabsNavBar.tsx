'use client';

import { useEtablissementStore } from "@/stores/etablissementStore";
import { useEffect, useState } from "react";
import { EtablissementPopulated } from "@/types/etablissement";
import { useAuth } from "@/stores/personnelStore";
import { Building2, Users, GraduationCap, Activity } from "lucide-react";

interface EtablissementTabsNavBarProps {
    etablissement: EtablissementPopulated | null;
    setEtablissement: (etablissement: EtablissementPopulated | null) => void;
}

const EtablissementTabsNavBar = ({
    etablissement,
    setEtablissement
}: EtablissementTabsNavBarProps) => {
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
        const totalMembers = etab.coge?.length || 0;
        return { totalMembers };
    };

    if (isLoading) {
        return (
            <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4">
                    <div className="flex space-x-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6">
                {/* En-tête avec titre */}
                <div className="py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Tableau de Bord - Établissements
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Sélectionnez un établissement pour voir ses données
                                </p>
                            </div>
                        </div>
                        
                        {/* Indicateur du nombre d'établissements */}
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Activity className="w-4 h-4" />
                            <span>{data.length} établissement{data.length > 1 ? 's' : ''} accessible{data.length > 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                {/* Onglets des établissements */}
                <div className="py-2">
                    <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                        {data.map((etab: EtablissementPopulated) => {
                            const isSelected = etablissement?._id === etab._id;
                            const stats = getEtablissementStats(etab);
                            
                            return (
                                <button
                                    key={etab._id}
                                    onClick={() => setEtablissement(etab)}
                                    className={`
                                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 min-w-max
                                        ${isSelected 
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300' 
                                            : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
                                        }
                                    `}
                                >
                                    {/* Avatar de l'établissement */}
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-sm
                                        ${isSelected 
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                        }
                                    `}>
                                        {etab.sigle?.charAt(0) || 'E'}
                                    </div>
                                    
                                    {/* Informations de l'établissement */}
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium text-sm">
                                            {etab.designation}
                                        </span>
                                        <div className="flex items-center space-x-2 text-xs opacity-75">
                                            <span>{etab.sigle}</span>
                                            <span>•</span>
                                            <div className="flex items-center space-x-1">
                                                <Users className="w-3 h-3" />
                                                <span>{stats.totalMembers}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Indicateur de sélection */}
                                    {isSelected && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Informations détaillées de l'établissement sélectionné */}
                {etablissement && (
                    <div className="py-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Établissement actif</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Users className="w-4 h-4" />
                                    <span>{getEtablissementStats(etablissement).totalMembers} membres dans le COGE</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>Données en temps réel</span>
                                </div>
                            </div>
                            
                            {/* Actions rapides */}
                            <div className="flex items-center space-x-2">
                                <button className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                                    Voir détails
                                </button>
                                <button className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    Exporter
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EtablissementTabsNavBar;
