"use client";

import { useState, useEffect } from "react";
import { Faculte, FaculteFormData } from "@/types/etablissement";
import { Personnel } from "@/types/personnel";
import { useSelectedEtablissement } from "@/stores/etablissementStore";
import { 
    ArrowLeft, 
    ArrowRight, 
    Check, 
    Upload, 
    X, 
    Search,
    UserPlus,
    Trash2,
    FileText,
    Users,
    CheckCircle
} from "lucide-react";
import BlobManager from "@/services/BlobManager";
import Image from "next/image";

interface FaculteWizardProps {
    faculte?: Faculte | null;
    mode: 'create' | 'edit' | 'view';
    personnels: Personnel[];
    onSave?: () => void;
    onCancel: () => void;
}

interface TeamMember {
    userId: Personnel;
    role: string;
}

interface TeacherMember {
    userId: Personnel;
    role: string;
}

const FaculteWizard = ({ faculte, mode, personnels, onSave, onCancel }: FaculteWizardProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isUploading, setIsUploading] = useState(false);
    const { saveFaculte } = useSelectedEtablissement();
    
    // Étape 1: Définition
    const [nom, setNom] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState('');
    
    // Étape 2: Équipe de direction
    const [equipe, setEquipe] = useState<TeamMember[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
    const [memberRole, setMemberRole] = useState('');
    
    // Étape 3: Enseignants
    const [enseignants, setEnseignants] = useState<TeacherMember[]>([]);
    const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState<Personnel | null>(null);
    const [teacherRole, setTeacherRole] = useState('enseignant');
    
    // Store
    const { selectedEtablissement, updateFacultes } = useSelectedEtablissement();
    
    // Initialiser avec les données existantes
    useEffect(() => {
        if (faculte) {
            setNom(faculte.nom || '');
            setDescription(faculte.description || '');
            setLogo(faculte.logo || '');
            setEquipe(faculte.equipe || []);
            setEnseignants(faculte.enseignants || []);
        }
    }, [faculte]);
    
    // Filtrer les personnels selon la recherche (équipe)
    const filteredPersonnels = personnels.filter(p => {
        const fullName = `${p.nom} ${p.post_nom} ${p.prenom}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });
    
    // Filtrer les personnels pour les enseignants
    const filteredTeachers = personnels.filter(p => {
        const fullName = `${p.nom} ${p.post_nom} ${p.prenom}`.toLowerCase();
        return fullName.includes(teacherSearchQuery.toLowerCase());
    });
    
    // Ajouter un membre à l'équipe
    const handleAddMember = () => {
        if (!selectedPersonnel || !memberRole.trim()) return;
        
        // Vérifier si le membre n'est pas déjà dans l'équipe
        const exists = equipe.some(m => m.userId._id === selectedPersonnel._id);
        if (exists) {
            alert('Ce membre fait déjà partie de l\'équipe');
            return;
        }
        
        setEquipe([...equipe, { userId: selectedPersonnel, role: memberRole }]);
        setSelectedPersonnel(null);
        setMemberRole('');
        setSearchQuery('');
    };
    
    // Supprimer un membre de l'équipe
    const handleRemoveMember = (personnelId: string) => {
        setEquipe(equipe.filter(m => m.userId._id !== personnelId));
    };
    
    // Ajouter un enseignant
    const handleAddTeacher = () => {
        if (!selectedTeacher || !teacherRole.trim()) return;
        
        const exists = enseignants.some(t => t.userId._id === selectedTeacher._id);
        if (exists) {
            alert('Cet enseignant fait déjà partie de la liste');
            return;
        }
        
        setEnseignants([...enseignants, { userId: selectedTeacher, role: teacherRole }]);
        setSelectedTeacher(null);
        setTeacherRole('enseignant');
        setTeacherSearchQuery('');
    };
    
    // Supprimer un enseignant
    const handleRemoveTeacher = (personnelId: string) => {
        setEnseignants(enseignants.filter(t => t.userId._id !== personnelId));
    };
    
    // Upload du logo
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Validation
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image ne doit pas dépasser 5MB');
            return;
        }
        
        try {
            setIsUploading(true);
            const response = await BlobManager.createBlob(file, {
                type: 'faculte-logo',
                timestamp: Date.now()
            });
            
            if (response.url) {
                setLogo(response.url);
            } else {
                throw new Error('URL non reçue du serveur');
            }
        } catch (error) {
            console.error('Erreur upload logo:', error);
            alert('Erreur lors de l\'upload du logo');
        } finally {
            setIsUploading(false);
        }
    };
    
    // Validation de l'étape 1
    const isStep1Valid = nom.trim().length > 0 && description.trim().length > 0;
    
    // Validation de l'étape 2
    const isStep2Valid = equipe.length > 0;
    
    // Validation de l'étape 3
    const isStep3Valid = enseignants.length > 0;
    
    // Passer à l'étape suivante
    const handleNext = () => {
        if (currentStep === 1 && !isStep1Valid) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        if (currentStep === 2 && !isStep2Valid) {
            alert('Veuillez ajouter au moins un membre à l\'équipe');
            return;
        }
        if (currentStep === 3 && !isStep3Valid) {
            alert('Veuillez ajouter au moins un enseignant');
            return;
        }
        setCurrentStep(currentStep + 1);
    };
    
    // Revenir à l'étape précédente
    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };
    
    // Fonction de sauvegarde
    const handleSave = async () => {
        const faculteData: FaculteFormData & { _id?: string } = {
            nom,
            description,
            logo,
            equipe: equipe.map(m => ({
                userId: typeof m.userId === 'string' ? m.userId : m.userId._id!,
                role: m.role
            })),
            enseignants: enseignants.map(t => ({
                userId: typeof t.userId === 'string' ? t.userId : t.userId._id!,
                role: t.role
            }))
        };
        
        // Si on est en mode édition, ajouter l'_id
        if (mode === 'edit' && faculte?._id) {
            faculteData._id = faculte._id;
        }
        
        try {
            await saveFaculte(faculteData);
            onSave?.();
            onCancel();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            alert('Erreur lors de la sauvegarde de la faculté');
        }
    };
    
    const isReadOnly = mode === 'view';
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {mode === 'view' ? 'Détails de la faculté' : mode === 'edit' ? 'Modifier la faculté' : 'Créer une faculté'}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {mode === 'view' ? faculte?._id : `Étape ${currentStep} sur 4`}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Stepper - Masqué en mode view */}
                {!isReadOnly && (
                    <div className="mt-6 flex items-center justify-between">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                    currentStep >= step
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'
                                }`}>
                                    {currentStep > step ? <Check className="w-5 h-5" /> : step}
                                </div>
                                {step < 4 && (
                                    <div className={`flex-1 h-1 mx-2 ${
                                        currentStep > step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Contenu */}
            <div className="p-6">
                {/* Étape 1: Définition */}
                {(currentStep === 1 || isReadOnly) && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            <FileText className="w-5 h-5" />
                            Définition de la faculté
                        </div>
                        
                        {/* Nom */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nom de la faculté <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                disabled={isReadOnly}
                                placeholder="Ex: Faculté des Sciences"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        
                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isReadOnly}
                                rows={4}
                                placeholder="Décrivez la faculté..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        
                        {/* Logo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Logo de la faculté
                            </label>
                            
                            {logo ? (
                                <div className="flex items-start gap-4">
                                    <div className="relative w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                        <Image
                                            src={logo}
                                            alt="Logo"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {!isReadOnly && (
                                        <button
                                            onClick={() => setLogo('')}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ) : !isReadOnly && (
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        disabled={isUploading}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                                                <p className="mt-2 text-sm text-gray-500">Upload en cours...</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-12 h-12 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-500">
                                                    Cliquez pour uploader un logo
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    PNG, JPG jusqu'à 5MB
                                                </p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Étape 2: Équipe de direction */}
                {(currentStep === 2 || (isReadOnly && equipe.length > 0)) && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            <Users className="w-5 h-5" />
                            Équipe de direction
                        </div>
                        
                        {/* Formulaire d'ajout - Masqué en mode view */}
                        {!isReadOnly && (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                                    Ajouter un membre
                                </h3>
                                
                                {/* Recherche de personnel */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Rechercher un membre
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Nom, postnom ou prénom..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        
                                        {/* Résultats de recherche */}
                                        {searchQuery && (
                                            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                                                {filteredPersonnels.length === 0 ? (
                                                    <p className="p-4 text-sm text-gray-500 text-center">
                                                        Aucun personnel trouvé
                                                    </p>
                                                ) : (
                                                    filteredPersonnels.map((p) => (
                                                        <button
                                                            key={p._id}
                                                            onClick={() => {
                                                                setSelectedPersonnel(p);
                                                                setSearchQuery('');
                                                            }}
                                                            className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                                                        >
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {p.nom} {p.post_nom} {p.prenom}
                                                            </p>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Personnel sélectionné */}
                                    {selectedPersonnel && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {selectedPersonnel.nom} {selectedPersonnel.post_nom} {selectedPersonnel.prenom}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {selectedPersonnel.email}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedPersonnel(null)}
                                                    className="p-1 text-gray-500 hover:text-gray-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Rôle */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Rôle
                                        </label>
                                        <input
                                            type="text"
                                            value={memberRole}
                                            onChange={(e) => setMemberRole(e.target.value)}
                                            placeholder="Ex: Doyen, Vice-Doyen..."
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    {/* Bouton d'ajout */}
                                    <button
                                        onClick={handleAddMember}
                                        disabled={!selectedPersonnel || !memberRole.trim()}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Ajouter à l'équipe
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Liste des membres */}
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                                Membres de l'équipe ({equipe.length})
                            </h3>
                            
                            {equipe.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">
                                    Aucun membre dans l'équipe
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {equipe.map((member, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {member.userId.nom} {member.userId.post_nom} {member.userId.prenom}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {member.role}
                                                </p>
                                            </div>
                                            {!isReadOnly && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.userId._id!)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Étape 3: Enseignants */}
                {(currentStep === 3 || (isReadOnly && enseignants.length > 0)) && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            <Users className="w-5 h-5" />
                            Liste des enseignants
                        </div>
                        
                        {/* Formulaire d'ajout - Masqué en mode view */}
                        {!isReadOnly && (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                                    Ajouter un enseignant
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Rechercher un enseignant
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={teacherSearchQuery}
                                                onChange={(e) => setTeacherSearchQuery(e.target.value)}
                                                placeholder="Nom, post-nom ou prénom..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        
                                        {/* Résultats de recherche */}
                                        {teacherSearchQuery && (
                                            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                                                {filteredTeachers.length === 0 ? (
                                                    <p className="p-4 text-sm text-gray-500 text-center">
                                                        Aucun personnel trouvé
                                                    </p>
                                                ) : (
                                                    filteredTeachers.map((p) => (
                                                        <button
                                                            key={p._id}
                                                            onClick={() => {
                                                                setSelectedTeacher(p);
                                                                setTeacherSearchQuery('');
                                                            }}
                                                            className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                                                        >
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {p.nom} {p.post_nom} {p.prenom}
                                                            </p>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Enseignant sélectionné */}
                                    {selectedTeacher && (
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {selectedTeacher.nom} {selectedTeacher.post_nom} {selectedTeacher.prenom}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {selectedTeacher.email}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedTeacher(null)}
                                                    className="p-1 text-gray-500 hover:text-gray-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Rôle */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Rôle
                                        </label>
                                        <input
                                            type="text"
                                            value={teacherRole}
                                            onChange={(e) => setTeacherRole(e.target.value)}
                                            placeholder="enseignant"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    {/* Bouton d'ajout */}
                                    <button
                                        onClick={handleAddTeacher}
                                        disabled={!selectedTeacher || !teacherRole.trim()}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Ajouter à la liste
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Liste des enseignants */}
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                                Enseignants ({enseignants.length})
                            </h3>
                            
                            {enseignants.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">
                                    Aucun enseignant dans la liste
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {enseignants.map((teacher, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {teacher.userId.nom} {teacher.userId.post_nom} {teacher.userId.prenom}
                                                </p>
                                            </div>
                                            {!isReadOnly && (
                                                <button
                                                    onClick={() => handleRemoveTeacher(teacher.userId._id!)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Étape 4: Résumé */}
                {currentStep === 4 && !isReadOnly && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            <CheckCircle className="w-5 h-5" />
                            Résumé
                        </div>
                        
                        <div className="space-y-6">
                            {/* Informations générales */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                                    Informations générales
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-4">
                                        {logo && (
                                            <div className="relative w-20 h-20 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={logo}
                                                    alt="Logo"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Nom</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{nom}</p>
                                            <p className="text-sm text-gray-500 mt-2">Description</p>
                                            <p className="text-gray-700 dark:text-gray-300">{description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Équipe de direction */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                                    Équipe de direction ({equipe.length} membre{equipe.length > 1 ? 's' : ''})
                                </h3>
                                <div className="space-y-2">
                                    {equipe.map((member, index) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {member.userId.nom} {member.userId.post_nom} {member.userId.prenom}
                                                </p>
                                                <p className="text-sm text-gray-500">{member.userId.email}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                                                {member.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Enseignants */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                                    Enseignants ({enseignants.length} enseignant{enseignants.length > 1 ? 's' : ''})
                                </h3>
                                <div className="space-y-2">
                                    {enseignants.map((teacher, index) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {teacher.userId.nom} {teacher.userId.post_nom} {teacher.userId.prenom}
                                                </p>
                                                <p className="text-sm text-gray-500">{teacher.userId.email}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm">
                                                {teacher.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer - Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                    {isReadOnly ? (
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Fermer
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={currentStep === 1 ? onCancel : handlePrevious}
                                className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {currentStep === 1 ? 'Annuler' : 'Précédent'}
                            </button>
                            
                            {currentStep < 4 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || (currentStep === 3 && !isStep3Valid)}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Suivant
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    <Check className="w-4 h-4" />
                                    {mode === 'edit' ? 'Enregistrer les modifications' : 'Créer la faculté'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FaculteWizard;
