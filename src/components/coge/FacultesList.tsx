"use client";

import { Etablissement, Faculte } from "@/types/etablissement";
import { GraduationCap, Building2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import AgentsList from "./AgentsList";
import { API_URL } from "@/app/(admin)/(coge)/paiements/[slug]/page";
import { Personnel, CreatePersonnelData, UpdatePersonnelData } from "@/types/personnel";
import { useEtablissementStore } from "@/stores/etablissementStore";

interface FacultesListProps {
    etablissement: Etablissement;
    personnel: string;
    categorie: string;
    onBack: () => void;
}

const FacultesList = ({
    etablissement,
    personnel,
    categorie,
    onBack
}: FacultesListProps) => {
    const facultes = etablissement?.facultes || [];
    const [view, setView] = useState<string | null>('facultes');
    const [data, setData] = useState<Personnel[]>([]);
    const [faculte, setFaculte] = useState<Faculte | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { fetchEtablissements } = useEtablissementStore();

    useEffect(() => {
        const fetchAllData = async () => {
                const allAgents = await Promise.all(faculte?.enseignants.map(async (agent : any) => {
                    try {
                        const result = await fetchPersonnel(agent?.userId?._id as string);
                        
                        if(result){
                            console.log("Agent : ", result);
                            return result;
                        } else {
                            return null;
                        }
                    } catch (error) {
                        console.error('Erreur lors du chargement des données:', error);
                        return null;
                    }
                }));
                console.log("All agents : ", allAgents);
                const filterAgants = allAgents.filter((agent : Personnel) => 
                    agent !== null && 
                    agent && 
                    typeof agent === 'object' && 
                    agent.categorie && 
                    agent.nom && 
                    agent.categorie.toUpperCase() === categorie.toUpperCase()
                );
                console.log("Filter agents : ", filterAgants);
                setData(filterAgants);
        };

        if(faculte){
            fetchAllData();
        }
    }, [faculte]); // Supprimer etablissements de la dépendance pour éviter les rechargements inutiles
        
    const fetchPersonnel = async (id: string) => {
        try {   
            const response = await fetch(`${API_URL}/users/${id}`);
            const data = await response.json();
            if (data.success) {
                return data.data;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des personnel:', error);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Recharger depuis le serveur pour avoir les données fraîches
            await fetchEtablissements();
            
            // Recharger les données de la faculté
            if (faculte) {
                const allAgents = await Promise.all(faculte.enseignants.map(async (agent : any) => {
                    try {
                        const result = await fetchPersonnel(agent?.userId?._id as string);
                        return result || null;
                    } catch (error) {
                        console.error('Erreur lors du chargement des données:', error);
                        return null;
                    }
                }));
                const filterAgants = allAgents.filter((agent : Personnel) => 
                    agent !== null && 
                    agent && 
                    typeof agent === 'object' && 
                    agent.categorie && 
                    agent.nom && 
                    agent.categorie.toUpperCase() === categorie.toUpperCase()
                );
                setData(filterAgants);
            }
        } catch (error) {
            console.error('Erreur lors du rafraîchissement:', error);
            alert('Erreur lors du rafraîchissement des données');
        } finally {
            setIsRefreshing(false);
        }
    };

    if (facultes.length === 0) {
        return (
            <div className="mt-6 p-8 text-center bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucune faculté trouvée
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Aucune faculté n'est configurée pour cet établissement
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-4">
        {
            view === 'facultes' ? (
                <>
                    <div className="flex items-center gap-3">
                        <button 
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                            onClick={onBack}
                        >
                            Retour
                        </button>
                        <button 
                            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center gap-2 transition-colors disabled:opacity-50"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            title="Actualiser les données"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                        </button>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        Facultés et Personnel Académique ({facultes.length})
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {facultes.map((faculte, index) => (
                            <div key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg p-2">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {faculte.nom}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {faculte.description}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Enseignants */}
                                {faculte.enseignants && faculte.enseignants.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Enseignants ({faculte.enseignants.length})
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {faculte.enseignants.map((enseignant, ensIndex) => (
                                                <div key={ensIndex} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                                                    {enseignant.userId?.nom}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                        Aucun enseignant assigné
                                    </p>
                                )}
                                
                                {/* Équipe */}
                                {faculte.equipe && faculte.equipe.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Équipe ({faculte.equipe.length})
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {faculte.equipe.map((membre, membreIndex) => (
                                                <div key={membreIndex} className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                                                    {membre.role}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button 
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                    onClick={() => {
                                        setView('agents');
                                        setFaculte(faculte)
                                    }}
                                >
                                    Voir les agents
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <AgentsList 
                    data={data} 
                    personnel={personnel} 
                    categorie={categorie.toUpperCase()} 
                    onBack={() => setView('facultes')}
                    onRefresh={() => {}} // Fonction vide car le refresh est maintenant géré par le parent
                    addAction={async (data: CreatePersonnelData) => {
                        console.log('EtabId', etablissement?._id);
                        console.log('FaculteId', faculte?._id);
                        console.log('Personnel', personnel);
                        console.log('Categorie', categorie);
                        console.log("Created agent in faculty:", data);
                        
                        try {
                            const response = await fetch(`${API_URL}/users/enseignant/${etablissement?._id}/${personnel}/${faculte?._id}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(data),
                            });
                            const result = await response.json();
                            
                            if(result.success){
                                const newAgent = result.data;
                                console.log("Agent créé avec succès:", newAgent);
                                
                                // Persister automatiquement le nouvel agent dans l'état local
                                if (newAgent.categorie.toUpperCase() === categorie.toUpperCase()) {
                                    setData(prevData => [...prevData, newAgent]);
                                }
                                
                                return newAgent;
                            } else {
                                console.error("Data error lors de la création:", result);
                                const errorMessage = result.message;
                                console.log("Erreur lors de la création:", errorMessage);
                                return errorMessage;
                            }
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion ou problème serveur';
                            console.error('Erreur lors de la création de l\'agent:', errorMessage);
                            return errorMessage;
                        }
                    }}
                    updateAction={async (data: UpdatePersonnelData) => {
                        console.log("Updated agent in faculty:", data);
                        
                        try {
                            // Appeler l'API de mise à jour
                            const response = await fetch(`${API_URL}/users/${data._id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(data),
                            });
                            const result = await response.json();
                            
                            if(result.success){
                                const updatedAgent = result.data;
                                console.log("Agent modifié avec succès:", updatedAgent);
                                
                                // Persister automatiquement la modification dans l'état local
                                setData(prevData => 
                                    prevData.map(agent => 
                                        agent._id === updatedAgent._id ? updatedAgent : agent
                                    )
                                );
                                
                                return updatedAgent;
                            } else {
                                console.log("Erreur lors de la modification:", result.message);
                                return null;
                            }
                        } catch (error) {
                            console.error('Erreur lors de la modification de l\'agent:', error);
                            return null;
                        }
                    }}
                    onAgentDeleted={(deletedAgentId: string) => {
                        // Supprimer l'agent de l'état local
                        setData(prevData => prevData.filter(agent => agent._id !== deletedAgentId));
                        console.log("Agent supprimé localement:", deletedAgentId);
                    }}
                />
            )
        }
        </div>
    );
}

export default FacultesList;
