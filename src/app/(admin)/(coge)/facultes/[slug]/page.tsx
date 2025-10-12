'use client';

import { useParams } from 'next/navigation';
import { useSelectedEtablissement } from '@/stores/etablissementStore';
import { useEffect, useState } from 'react';
import { EtablissementPopulated, Faculte, FaculteFormData } from '@/types/etablissement';
import { usePersonnelStore } from '@/stores/personnelStore';
import FaculteDataTable from '@/components/faculte/FaculteDataTable';
import FaculteWizard from '@/components/faculte/FaculteWizard';
import { Plus, GraduationCap, Loader2, Building2 } from 'lucide-react';

const FacultesPage = () => {
    const params = useParams();
    const etablissementId = params.slug as string;
    const { selectedEtablissement, fetchEtablissementById, saveFaculte, deleteFaculte } = useSelectedEtablissement();
    const { personnels, loadPersonnels } = usePersonnelStore();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFaculte, setSelectedFaculte] = useState<Faculte | null>(null);
    const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    fetchEtablissementById(etablissementId),
                    loadPersonnels()
                ]);
            } catch (error) {
                console.error('Erreur lors du chargement:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [etablissementId]);
    
    // Créer une faculté
    const handleCreate = () => {
        setSelectedFaculte(null);
        setMode('create');
    };
    
    // Voir les détails d'une faculté
    const handleView = (faculte: Faculte) => {
        setSelectedFaculte(faculte);
        setMode('view');
    };
    
    // Modifier une faculté
    const handleEdit = (faculte: Faculte) => {
        setSelectedFaculte(faculte);
        setMode('edit');
    };
    
    // Supprimer une faculté
    const handleDelete = async (faculteId: string) => {
        if (!selectedEtablissement) return;
        
        const confirmed = confirm('Êtes-vous sûr de vouloir supprimer cette faculté ?');
        if (!confirmed) return;
        
        try {
            setIsDeleting(faculteId);
            
            // Utiliser la méthode deleteFaculte du store
            await deleteFaculte(faculteId);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression de la faculté');
        } finally {
            setIsDeleting(null);
        }
    };
    
    // Sauvegarder une faculté (création ou modification)
    const handleSave = () => {
        // La sauvegarde est maintenant gérée par FaculteWizard
        setMode('list');
        setSelectedFaculte(null);
    };
    
    // Annuler et retourner à la liste
    const handleCancel = () => {
        setMode('list');
        setSelectedFaculte(null);
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }
    
    if (!selectedEtablissement) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Building2 className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500">Établissement non trouvé</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {mode === 'list' ? (
                <>
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <GraduationCap className="w-8 h-8" />
                                    Facultés
                                </h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {selectedEtablissement.designation}
                                </p>
                            </div>
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Nouvelle faculté
                            </button>
                        </div>
                    </div>
                    
                    {/* DataTable */}
                    <FaculteDataTable
                        facultes={selectedEtablissement.facultes || []}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                    />
                </>
            ) : (
                /* Wizard (Création/Édition/Vue) */
                <FaculteWizard
                    faculte={selectedFaculte}
                    mode={mode as 'create' | 'edit' | 'view'}
                    personnels={personnels}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
};

export default FacultesPage;
