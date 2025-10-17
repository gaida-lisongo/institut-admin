"use client";

import { useEtablissementStore } from "@/stores/etablissementStore";
import { Administratif, Etablissement } from "@/types/etablissement";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, GraduationCap, Settings, Wrench, Building2, ChevronRight } from "lucide-react";
import { CreatePersonnelData, Personnel, UpdatePersonnelData } from "@/types/personnel";
import { API_URL } from "../../paiements/[slug]/page";
import FacultesList from "@/components/coge/FacultesList";
import AgentsList from "@/components/coge/AgentsList";

const navData = [
    {
        personnel: "PAS",
        title: "Personnel Académique et Scientifique",
        description: "Gestion du personnel enseignant et de recherche",
        icon: <GraduationCap className="w-6 h-6" />,
        color: "bg-blue-500",
        hoverColor: "hover:bg-blue-600",
        categories: ["Académique", "Scientifique"]
    },
    {
        personnel: "PATO",
        title: "Personnel Administratif, Technique et Ouvrier",
        description: "Gestion du personnel de soutien et d'administration",
        icon: <Settings className="w-6 h-6" />,
        color: "bg-green-500",
        hoverColor: "hover:bg-green-600",
        categories: ["Administratif", "Technique", "Ouvrier"]
    }
];

const categoryIcons: { [key: string]: React.ReactElement } = {
    "Académique": <GraduationCap className="w-5 h-5" />,
    "Scientifique": <Users className="w-5 h-5" />,
    "Administratif": <Building2 className="w-5 h-5" />,
    "Technique": <Wrench className="w-5 h-5" />,
    "Ouvrier": <Settings className="w-5 h-5" />
};

const NavigationAdministratifs = ({ 
    onCategoriesSelect,
    activeEtablissement,
    onClick
}: { onCategoriesSelect: (category: string[]) => void, activeEtablissement: string, onClick: (category: string) => void }) => {
    const [active, setActive] = useState<string | null>(null);

    const fetchUserDetails = async (userId: string) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur lors du chargement des details:', error);
            return null;
        }
    };
    const handleCategorySelect = (category: string) => {
        onClick(category);
        setActive(category);
        onCategoriesSelect(navData.find((item) => item.personnel === category)?.categories || []);
    };

    useEffect(() => {
        // Initialiser avec la première catégorie seulement au premier rendu
        if (active === null) {
            setActive("PAS");
            onCategoriesSelect(navData[0].categories);
            onClick(navData[0].personnel);
        }
    }, []); // Dépendances vides pour n'exécuter qu'une fois

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Gestion du Personnel
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {activeEtablissement || "Établissement"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Cards */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {navData.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleCategorySelect(item.personnel)}
                            className={`
                                relative cursor-pointer rounded-xl border-2 transition-all duration-300 p-6
                                ${active === item.personnel 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-lg transform scale-105' 
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                                }
                            `}
                        >
                            {/* Badge actif */}
                            {active === item.personnel && (
                                <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-2">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            )}

                            {/* Icône et titre */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`${item.color} ${item.hoverColor} text-white rounded-lg p-3 transition-colors`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            {/* Catégories */}
                            <div className="flex flex-wrap gap-2">
                                {item.categories.map((category, catIndex) => (
                                    <div
                                        key={catIndex}
                                        className={`
                                            flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                                            ${active === item.personnel
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }
                                        `}
                                    >
                                        {categoryIcons[category]}
                                        {category}
                                    </div>
                                ))}
                            </div>

                            {/* Indicateur de sélection */}
                            <div className={`
                                mt-4 h-1 rounded-full transition-all duration-300
                                ${active === item.personnel ? item.color : 'bg-gray-200 dark:bg-gray-600'}
                            `} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const AdministratifsPage = () => {
    const params = useParams();
    const slug = params.slug;
    const [etablissement, setEtablissement] = useState<Etablissement | null>(null);
    const { etablissements, isLoading, fetchEtablissements } = useEtablissementStore();
    const [currentPersonnel, setCurrentPersonnel] = useState<string | null>(null);
    const [currentCategorie, setCurrentCategorie] = useState<string | null>(null);
    const [activeCategories, setActiveCategories] = useState<string[]>([]);
    const [data, setData] = useState<Personnel[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Déplacer useEffect au niveau du composant principal
    useEffect(() => {
        const fetchAllData = async () => {
            const administratifs = etablissement?.administratifs || [];
            if (!administratifs.length || !currentCategorie) return;

            const allAgents = await Promise.all(administratifs.map(async (agent : any) => {
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
                agent.categorie.toUpperCase() === currentCategorie.toUpperCase()
            );
            console.log("Filter agents : ", filterAgants);
            setData(filterAgants);
        };

        if(etablissement?.administratifs && currentCategorie){
            fetchAllData();
        }
    }, [etablissement?.administratifs, currentCategorie, isLoading, refreshTrigger]);

    const renderAdministratifs = () => {

        return (
            <>
                <AgentsList 
                    data={data} 
                    personnel={currentPersonnel} 
                    categorie={currentCategorie} 
                    onBack={() => setCurrentCategorie(null)}
                    onRefresh={() => {
                        // Déclencher le rechargement via useEffect
                        setRefreshTrigger(prev => prev + 1);
                    }}
                    addAction={(data: CreatePersonnelData) => {
                        console.log("Current etabId :", etablissement?._id);
                        console.log("Current personnel :", currentPersonnel);
                        console.log("Current categorie :", currentCategorie);
                        console.log("Created agent :", data);

                        fetch(`${API_URL}/users/administratif/${etablissement?._id}/${currentPersonnel}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify(data)
                        })
                        .then(response => response.json())
                        .then(result => {
                            console.log('Agent créé avec succès:', result);
                            setData(prev => [...prev, result?.data]);
                            fetchEtablissements()
                                .then(() => {
                                    setRefreshTrigger(prev => prev + 1);
                                })
                                .catch(error => {
                                    console.error('Erreur lors du chargement des établissements:', error);
                                });
                        })
                        .catch(error => {
                            console.error('Erreur lors de la création de l\'agent:', error);
                        });

                    }}
                    updateAction={(data: UpdatePersonnelData) => {
                        console.log("Updated agent :", data);
                    }}
                />
            </>
        );
    }

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

    useEffect(() => {
        const etab = etablissements.find((etab) => etab._id.toString() === slug);
        if (etab) {
            setEtablissement(etab);
        }
    }, [slug, isLoading]);

    // Debug pour voir l'état actuel
    console.log('Current Personnel:', currentPersonnel);
    console.log('Current Categorie:', currentCategorie);

    let renderPage;

    switch (currentCategorie) {
        case 'Académique':
        case 'Scientifique':
            renderPage = (
                <FacultesList
                    etablissement={etablissement!}
                    personnel={currentPersonnel}
                    categorie={currentCategorie}
                    onBack={() => setCurrentCategorie(null)}
                />
            );
            break;
        case "Administratif":
        case "Technique":
        case "Ouvrier":
            renderPage = renderAdministratifs();
            break;
        default:
            renderPage = (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Navigation principale */}
                        <NavigationAdministratifs 
                            onCategoriesSelect={setActiveCategories} 
                            activeEtablissement={etablissement?.designation || ""} 
                            onClick={setCurrentPersonnel}
                        />
                        
                        {/* Section des catégories actives */}
                        {activeCategories.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Users className="w-6 h-6 text-blue-600" />
                                        Catégories de Personnel Sélectionnées
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        Gérez les différentes catégories de personnel de votre établissement
                                    </p>
                                </div>
                                
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {activeCategories.map((category, index) => (
                                            <div
                                                key={index}
                                                className="group bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-700 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-500 text-white rounded-lg p-2 group-hover:bg-blue-600 transition-colors">
                                                        {categoryIcons[category]}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                            {category}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Personnel {category.toLowerCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Indicateur d'action */}
                                                <div className="mt-3 flex items-center justify-between">
                                                    <button 
                                                        onClick={() => setCurrentCategorie(category)} 
                                                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 cursor-pointer"
                                                    >
                                                        <span>Gérer</span>
                                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                    <div className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full text-xs font-medium">
                                                        Actif
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Actions globales */}
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex flex-wrap gap-3">
                                            <button 
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Users className="w-4 h-4" />
                                                Voir tout le personnel
                                            </button>
                                            <button 
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Paramètres
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Message si aucune catégorie sélectionnée */}
                        {activeCategories.length === 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Sélectionnez une catégorie de personnel
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Choisissez PAS ou PATO pour commencer la gestion du personnel
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
    }

    return renderPage;
};

export default AdministratifsPage;