"use client";

import { useState, useEffect } from "react";
import { useFraisStore } from "@/stores/fraisStore";
import { Frais, Repartition } from "@/types/frais";
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FraisRepartitionManagerProps {
    fraisId: string;
}

const FraisRepartitionManager = ({ fraisId }: FraisRepartitionManagerProps) => {
    const router = useRouter();
    const { loadFraisById, updateFrais, isLoading, error } = useFraisStore();
    
    const [frais, setFrais] = useState<Frais | null>(null);
    const [repartitions, setRepartitions] = useState<Repartition[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newRepartition, setNewRepartition] = useState<Repartition>({
        entite: '',
        quotite: 0
    });

    // Chargement des données du frais
    useEffect(() => {
        const loadFraisData = async () => {
            if (fraisId) {
                const fraisData = await loadFraisById(fraisId);
                if (fraisData) {
                    setFrais(fraisData);
                    setRepartitions(fraisData.repartitions || []);
                }
            }
        };
        loadFraisData();
    }, [fraisId, loadFraisById]);

    // Validation des répartitions
    const validateRepartitions = (reps: Repartition[]): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];
        
        // Vérifier que chaque répartition a une entité et une quotité valide
        reps.forEach((rep, index) => {
            if (!rep.entite.trim()) {
                errors.push(`Entité manquante pour la répartition ${index + 1}`);
            }
            if (!rep.quotite || rep.quotite <= 0 || rep.quotite > 100) {
                errors.push(`Quotité invalide pour la répartition ${index + 1} (doit être entre 1 et 100)`);
            }
        });

        // Vérifier que le total des quotités ne dépasse pas 100%
        const totalQuotite = reps.reduce((sum, rep) => sum + rep.quotite, 0);
        if (totalQuotite > 100) {
            errors.push(`Le total des quotités (${totalQuotite}%) ne peut pas dépasser 100%`);
        }

        return { isValid: errors.length === 0, errors };
    };

    // Ajouter une nouvelle répartition
    const handleAddRepartition = () => {
        if (!newRepartition.entite.trim() || newRepartition.quotite <= 0) {
            alert('Veuillez remplir tous les champs correctement');
            return;
        }

        const updatedRepartitions = [...repartitions, { ...newRepartition }];
        const validation = validateRepartitions(updatedRepartitions);
        
        if (!validation.isValid) {
            alert('Erreurs de validation:\n' + validation.errors.join('\n'));
            return;
        }

        setRepartitions(updatedRepartitions);
        setNewRepartition({ entite: '', quotite: 0 });
        setIsEditing(false);
    };

    // Modifier une répartition existante
    const handleEditRepartition = (index: number) => {
        setEditingIndex(index);
        setNewRepartition({ ...repartitions[index] });
        setIsEditing(true);
    };

    // Sauvegarder la modification
    const handleSaveEdit = () => {
        if (editingIndex === null) return;

        if (!newRepartition.entite.trim() || newRepartition.quotite <= 0) {
            alert('Veuillez remplir tous les champs correctement');
            return;
        }

        const updatedRepartitions = [...repartitions];
        updatedRepartitions[editingIndex] = { ...newRepartition };
        
        const validation = validateRepartitions(updatedRepartitions);
        
        if (!validation.isValid) {
            alert('Erreurs de validation:\n' + validation.errors.join('\n'));
            return;
        }

        setRepartitions(updatedRepartitions);
        setEditingIndex(null);
        setNewRepartition({ entite: '', quotite: 0 });
        setIsEditing(false);
    };

    // Supprimer une répartition
    const handleDeleteRepartition = (index: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette répartition ?')) {
            const updatedRepartitions = repartitions.filter((_, i) => i !== index);
            setRepartitions(updatedRepartitions);
        }
    };

    // Annuler l'édition
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingIndex(null);
        setNewRepartition({ entite: '', quotite: 0 });
    };

    // Sauvegarder toutes les modifications
    const handleSaveAll = async () => {
        if (!frais?._id) return;

        const validation = validateRepartitions(repartitions);
        if (!validation.isValid) {
            alert('Erreurs de validation:\n' + validation.errors.join('\n'));
            return;
        }

        try {
            const updatedFrais = await updateFrais(frais._id, {
                designation: frais.designation,
                categorie: frais.categorie,
                description: frais.description,
                montant: frais.montant,
                etabs: frais.etabs,
                repartitions: repartitions
            });

            if (updatedFrais) {
                alert('Répartitions sauvegardées avec succès !');
                setFrais(updatedFrais);
            }
        } catch (error) {
            alert('Erreur lors de la sauvegarde');
        }
    };

    // Retour à la liste
    const handleBack = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Chargement des données...</p>
                </div>
            </div>
        );
    }

    if (error || !frais) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-medium">Erreur</h3>
                    <p className="text-red-700 mt-2">{error || 'Frais non trouvé'}</p>
                    <button
                        onClick={handleBack}
                        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    const totalQuotite = repartitions.reduce((sum, rep) => sum + rep.quotite, 0);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Retour</span>
                    </button>
                    <h1 className="text-2xl font-bold">Gestion des Répartitions</h1>
                    <div></div>
                </div>

                {/* Informations du frais */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-2">{frais.designation}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Catégorie:</span> {frais.categorie}
                        </div>
                        <div>
                            <span className="font-medium">Montant:</span> {frais.montant.toLocaleString()} $
                        </div>
                        <div>
                            <span className="font-medium">Établissements:</span> {frais.etabs.join(', ')}
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className="font-medium">Description:</span> {frais.description}
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{repartitions.length}</div>
                    <div className="text-sm text-blue-600">Répartitions</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{totalQuotite}%</div>
                    <div className="text-sm text-green-600">Total Quotité</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">{100 - totalQuotite}%</div>
                    <div className="text-sm text-orange-600">Reste Disponible</div>
                </div>
            </div>

            {/* Formulaire d'ajout/édition */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                    {editingIndex !== null ? 'Modifier la répartition' : 'Ajouter une répartition'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Entité <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={newRepartition.entite}
                            onChange={(e) => setNewRepartition(prev => ({
                                ...prev,
                                entite: e.target.value
                            }))}
                            placeholder="Ex: Université, Faculté, Département..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Quotité (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={newRepartition.quotite}
                            onChange={(e) => setNewRepartition(prev => ({
                                ...prev,
                                quotite: parseFloat(e.target.value) || 0
                            }))}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="flex items-end space-x-2">
                        {editingIndex !== null ? (
                            <>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>Sauvegarder</span>
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Annuler</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleAddRepartition}
                                disabled={isEditing}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Ajouter</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Liste des répartitions */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Répartitions actuelles</h3>
                        {repartitions.length > 0 && (
                            <button
                                onClick={handleSaveAll}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                <Save className="h-4 w-4" />
                                <span>Sauvegarder tout</span>
                            </button>
                        )}
                    </div>
                </div>

                {repartitions.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="mb-4">
                            <Plus className="h-12 w-12 mx-auto text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Aucune répartition</h3>
                        <p>Ajoutez des répartitions pour ce frais.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Entité
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quotité
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Montant Calculé
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {repartitions.map((repartition, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">
                                                {repartition.entite}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {repartition.quotite}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                            {((frais.montant * repartition.quotite) / 100).toLocaleString()} $
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditRepartition(index)}
                                                    disabled={isEditing}
                                                    className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                                                    title="Modifier"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRepartition(index)}
                                                    disabled={isEditing}
                                                    className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FraisRepartitionManager;
