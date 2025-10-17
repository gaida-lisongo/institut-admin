"use client";

import React, { useState, useEffect } from "react";
import { Personnel, CreatePersonnelData, UpdatePersonnelData } from "@/types/personnel";
import { usePersonnelStore } from "@/stores/personnelStore";
import { Settings, Plus, Edit, Trash2, Search, User } from "lucide-react";
import PersonnelModal from "./PersonnelModal";

interface AgentsListProps {
    data: Personnel[];
    personnel: string;
    categorie: string;
    onBack: () => void;
    onRefresh: () => void;
    addAction: (data: CreatePersonnelData) => void;
    updateAction: (data: UpdatePersonnelData) => void;
    onAgentDeleted?: (deletedAgentId: string) => void; // Callback pour notifier la suppression
}

const AgentsList = ({ data, personnel, categorie, onBack, onRefresh, addAction, updateAction, onAgentDeleted }: AgentsListProps) => {
    const { deletePersonnel, updatePersonnel } = usePersonnelStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Personnel | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    
    // État local pour gérer les données avec les ajouts dynamiques
    const [localData, setLocalData] = useState<Personnel[]>(data);
    
    // Synchroniser localData avec data quand data change (ex: après refresh)
    useEffect(() => {
        setLocalData(data);
    }, [data]);

    // Filtrage des données selon le terme de recherche
    const filteredData = localData.filter(agent => 
        agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.post_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (agent: Personnel) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${agent.nom} ${agent.post_nom} ?`)) {
            setIsDeleting(agent._id!);
            try {
                await deletePersonnel(agent._id!);
                
                // Supprimer de l'état local immédiatement
                setLocalData(prevData => prevData.filter(a => a._id !== agent._id));
                
                // Notifier le parent de la suppression si callback fourni
                if (onAgentDeleted) {
                    onAgentDeleted(agent._id!);
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression de l\'agent');
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const handleEdit = (agent: Personnel) => {
        setEditingAgent(agent);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingAgent(null);
    };

    const handleModalSubmit = async (data: CreatePersonnelData | UpdatePersonnelData) => {
        try {
            if (editingAgent) { 
                const updatedAgent = await updateAction(data as UpdatePersonnelData);
                handleModalSuccess(true, updatedAgent); // true = modification
            } else {
                const newAgent = await addAction(data as CreatePersonnelData);
                handleModalSuccess(false, newAgent); // false = ajout, newAgent = données retournées
            }
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
        }
    };

    const handleModalSuccess = async (isUpdate: boolean = false, agentData?: any) => {
        handleModalClose();
        
        if (agentData) {
            if (isUpdate) {
                // Mettre à jour l'agent dans l'état local
                setLocalData(prevData => 
                    prevData.map(agent => 
                        agent._id === agentData._id ? agentData : agent
                    )
                );
                console.log('Agent modifié localement:', agentData);
            } else {
                // Ajouter le nouvel agent à l'état local
                setLocalData(prevData => [...prevData, agentData]);
                console.log('Nouvel agent ajouté localement:', agentData);
            }
        }
    };


    return (
        <div className="mt-6 space-y-6">
            {/* Header avec boutons d'action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                        onClick={onBack}
                    >
                        ← Retour
                    </button>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-6 h-6 text-green-600" />
                        {categorie} ({filteredData.length})
                    </h3>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                        onClick={() => {
                            console.log('Ouverture du modal pour ajouter un agent');
                            setShowModal(true);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter un agent
                    </button>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Rechercher par nom, matricule, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* DataTable */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Agent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Informations
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <User className="w-12 h-12 text-gray-400 mb-3" />
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                {searchTerm ? 'Aucun résultat trouvé' : 'Aucun agent trouvé'}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {searchTerm 
                                                    ? 'Essayez de modifier votre recherche ou actualiser les données' 
                                                    : `Aucun agent de catégorie ${categorie} n'est disponible. Cliquez sur "Ajouter un agent" pour commencer.`
                                                }
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((agent) => (
                                    <tr key={agent._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {agent.photo ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={agent.photo} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {agent.nom.charAt(0)}{agent.post_nom.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {agent.nom} {agent.post_nom} {agent.prenom}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {agent.matricule}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{agent.email}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{agent.telephone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{agent.grade || 'N/A'}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{agent.niveau || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {agent.sexe === 'M' ? 'Masculin' : 'Féminin'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{agent.nationalite}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(agent)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(agent)}
                                                    disabled={isDeleting === agent._id}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors disabled:opacity-50"
                                                    title="Supprimer"
                                                >
                                                    {isDeleting === agent._id ? (
                                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <PersonnelModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    onSuccess={handleModalSubmit}
                    editingPersonnel={editingAgent}
                    defaultCategorie={categorie.toString().toUpperCase() as Personnel['categorie']}
                />
            )}
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs">
                    Modal: {showModal ? 'OUVERT' : 'FERMÉ'} | Agents: {filteredData.length}
                </div>
            )}
        </div>
    );
};

export default AgentsList;
