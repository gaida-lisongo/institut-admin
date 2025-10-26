"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { usePersonnelContext } from './PersonnelDataWrapper';
import { usePersonnelStore } from '@/stores/personnelStore';
import { Personnel, CreatePersonnelData, Province } from '@/types/personnel';
// Icônes SVG simples pour remplacer Heroicons
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
  </svg>
);

const UserCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const FunnelIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
  </svg>
);
import UserCard from './UserCard';
import UserModal from './UserModal';
import { getGradeLabel } from '@/utils/gradeUtils';

// Types pour les composants UI
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  className?: string;
  title?: string;
  [key: string]: any; // Pour les autres props HTML
}

// Composants HTML simples pour remplacer les composants UI
const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  disabled = false, 
  className = '',
  title,
  ...props 
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800'
  };
  
  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
  [key: string]: any;
}

interface InputProps {
  className?: string;
  [key: string]: any;
}

interface AvatarProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
  [key: string]: any;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const Card = ({ children, className = '', ...props }: CardProps) => (
  <div className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }: CardProps) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...props }: CardProps) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

const Input = ({ className = '', ...props }: InputProps) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-800 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-400 ${className}`}
    {...props}
  />
);

const Badge = ({ children, variant = 'default', className = '', ...props }: BadgeProps) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    outline: 'border border-gray-200 dark:border-gray-700'
  };
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

const Avatar = ({ children, className = '', ...props }: AvatarProps) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`} {...props}>
    {children}
  </div>
);

const AvatarImage = ({ src, alt, className = '', ...props }: AvatarImageProps) => (
  src ? <img className={`aspect-square h-full w-full object-cover ${className}`} src={src} alt={alt} {...props} /> : null
);

const AvatarFallback = ({ children, className = '', ...props }: AvatarFallbackProps) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 ${className}`} {...props}>
    {children}
  </div>
);

interface UsersCardManagerProps {
  categorie: Personnel['categorie'];
  provinceId: string;
  provinceName?: string;
}

const UsersCardManager: React.FC<UsersCardManagerProps> = ({ 
  categorie, 
  provinceId, 
  provinceName 
}) => {
  // Utiliser le Context pour les données (pas de fetch automatique)
  const { 
    personnels, 
    isLoading, 
    error, 
    provinces,
    refreshData
  } = usePersonnelContext();

  // Utiliser le store seulement pour les actions CRUD
  const { 
    deletePersonnel,
    addPersonnel,
    updatePersonnel
  } = usePersonnelStore();

  // États locaux
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Personnel | null>(null);
  const [showUserCard, setShowUserCard] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filtrer les personnels par catégorie, province et recherche
  const filteredPersonnels = useMemo(() => {
    return personnels.filter(personnel => {
      console.log("Current user : ", personnel);
      
      const matchCategorie = personnel.categorie === categorie;
      const matchProvince = typeof personnel.province === 'string' 
        ? personnel.province === provinceId 
        : personnel.province._id === provinceId;
      
      // Filtrage par recherche
      const matchSearch = !searchQuery || 
        personnel.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        personnel.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        personnel.matricule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        personnel.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCategorie && matchProvince && matchSearch;
    });
  }, [personnels, categorie, provinceId, searchQuery]);

  // Récupérer le nom de la province
  const currentProvince = useMemo(() => {
    return provinces.find(p => p._id === provinceId);
  }, [provinces, provinceId]);

  // Plus besoin de charger les données - elles viennent du Context
  // Plus besoin d'appliquer les filtres automatiquement - on filtre côté client

  // Gestionnaires d'événements
  const handleSearch = (value: string) => {
    setSearchQuery(value); // Le filtrage se fait automatiquement via useMemo
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setShowUserModal(true);
  };

  const handleEditUser = (user: Personnel) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowUserModal(true);
  };

  const handleViewUser = (user: Personnel) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowUserModal(true);
  };

  const handleManageAuthorizations = (user: Personnel) => {
    setSelectedUser(user);
    setShowUserCard(true);
  };

  const handleDeleteUser = async (user: Personnel) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.nomComplet || `${user.nom} ${user.prenom}`} ?`)) {
      return;
    }

    setActionLoading(`delete-${user._id}`);
    try {
      await deletePersonnel(user._id);
      await refreshData(); // Rafraîchir les données après suppression
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = () => {
    refreshData(); // Utiliser la fonction du Context
  };

  const handleClearFilters = () => {
    setSearchQuery('');
  };

  // Fonction pour obtenir les initiales
  const getInitials = (personnel: Personnel) => {
    return `${personnel.nom.charAt(0)}${personnel.prenom.charAt(0)}`.toUpperCase();
  };

  // Fonction pour obtenir la couleur du badge de catégorie
  const getCategorieColor = (cat: Personnel['categorie']) => {
    switch (cat) {
      case 'ACADEMIQUE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'SCIENTIFIQUE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'ADMINISTRATIF': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'OUVRIER': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Fonction pour obtenir le nom de la catégorie
  const getCategorieLabel = (cat: Personnel['categorie']) => {
    switch (cat) {
      case 'ACADEMIQUE': return 'Académique';
      case 'SCIENTIFIQUE': return 'Scientifique';
      case 'ADMINISTRATIF': return 'Administratif';
      case 'OUVRIER': return 'Ouvrier';
      default: return cat;
    }
  };

  if (isLoading && filteredPersonnels.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du personnel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Personnel {getCategorieLabel(categorie)}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentProvince?.designation || provinceName || 'Province'} • {filteredPersonnels.length} agent{filteredPersonnels.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <svg className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </Button>
          
          <Button onClick={handleCreateUser} size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouvel Agent
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, matricule, email..."
                  value={searchQuery}
                  onChange={(e : any) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getCategorieColor(categorie)}>
                {getCategorieLabel(categorie)}
              </Badge>
              
              {searchQuery && (
                <Button
                  onClick={handleClearFilters}
                  variant="ghost"
                  size="sm"
                >
                  <FunnelIcon className="w-4 h-4 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message d'erreur */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Grille des agents */}
      {filteredPersonnels.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <UserCircleIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun agent trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery 
                ? "Aucun agent ne correspond à votre recherche."
                : `Aucun agent ${getCategorieLabel(categorie).toLowerCase()} dans cette province.`
              }
            </p>
            <Button onClick={handleCreateUser}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Ajouter le premier agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonnels.map((personnel) => (
            <Card key={personnel._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={personnel.photo} alt={personnel.nomComplet} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                        {getInitials(personnel)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {personnel.nomComplet || `${personnel.nom} ${personnel.prenom}`}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {personnel.matricule}
                      </p>
                    </div>
                  </div>
                  
                  {personnel.autorisations && personnel.autorisations.length > 0 && (
                    <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Informations de base */}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Email:</span> {personnel.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Téléphone:</span> {personnel.telephone}
                    </p>
                    {personnel.grade && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Grade:</span> {getGradeLabel(personnel.grade, personnel.categorie)}
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {personnel.sexe === 'M' ? 'Masculin' : 'Féminin'}
                    </Badge>
                    
                    {personnel.autorisations && personnel.autorisations.length > 0 && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {personnel.autorisations.length} autorisation{personnel.autorisations.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    
                    {personnel.documents && personnel.documents.length > 0 && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {personnel.documents.length} document{personnel.documents.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => handleViewUser(personnel)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Voir les détails"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => handleEditUser(personnel)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Modifier"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => handleManageAuthorizations(personnel)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Gérer les autorisations"
                      >
                        <ShieldCheckIcon className="w-4 h-4" />
                      </Button>
                      
                      {personnel.documents && personnel.documents.length > 0 && (
                        <Button
                          onClick={() => handleViewUser(personnel)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Voir les documents"
                        >
                          <DocumentTextIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleDeleteUser(personnel)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Supprimer"
                      disabled={actionLoading === `delete-${personnel._id}`}
                    >
                      {actionLoading === `delete-${personnel._id}` ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          mode={modalMode}
          defaultCategorie={categorie}
          defaultProvince={provinceId}
          defaultProvinceName={provinceName}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showUserCard && selectedUser && (
        <UserCard
          user={selectedUser}
          onClose={() => {
            setShowUserCard(false);
            setSelectedUser(null);
          }}
          
        />
      )}
    </div>
  );
};

export default UsersCardManager;
