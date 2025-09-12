'use client';

import React, { useState, useEffect } from 'react';
import TransactionService from '@/services/TransactionService';
import type { WithdrawAgent } from '@/services/TransactionService';
import WithdrawCard from './WithdrawCard';

interface WithdrawManagementProps {
  className?: string;
}

const WithdrawManagement: React.FC<WithdrawManagementProps> = ({ className = '' }) => {
  const [withdraws, setWithdraws] = useState<WithdrawAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'OK' | 'NO'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les retraits
  const fetchWithdraws = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await TransactionService.getAllWithdraws();
      if (result.success && result.data) {
        // Traitement des données comme dans le composant précédent
        const data = result.data as any[];
        
        if (data.length === 0) {
          setWithdraws([]);
          return;
        }
        
        // Si userId est déjà un objet, les données sont au format WithdrawAgent
        if (typeof data[0].userId === 'object' && data[0].userId !== null) {
          setWithdraws(data as WithdrawAgent[]);
        } else {
          // Sinon, transformer les données Withdraw en WithdrawAgent
          const withdrawsWithAgent = data.map(w => {
            const userIdString = String(w.userId);
            return {
              ...w,
              userId: {
                _id: userIdString,
                photo: '/images/user/default-avatar.png',
                nom: `Utilisateur ${userIdString.slice(-4)}`,
                matricule: `MAT${userIdString.slice(-6)}`,
                telephone: w.phoneNumber
              }
            } as WithdrawAgent;
          });
          
          setWithdraws(withdrawsWithAgent);
        }
      } else {
        setError(result.error || 'Erreur lors du chargement des retraits');
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Erreur lors du chargement des retraits');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    fetchWithdraws();
  }, []);

  // Filtrer les retraits
  const filteredWithdraws = withdraws.filter(withdraw => {
    // Filtre par statut
    if (filter !== 'all' && withdraw.status !== filter) {
      return false;
    }
    
    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        withdraw.userId.nom.toLowerCase().includes(searchLower) ||
        withdraw.userId.matricule.toLowerCase().includes(searchLower) ||
        withdraw.reference.toLowerCase().includes(searchLower) ||
        withdraw.orderNumber.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Gérer la mise à jour de statut
  const handleStatusUpdate = async (id: string, newStatus: 'OK' | 'NO') => {
    // Mettre à jour localement
    setWithdraws(prev => 
      prev.map(w => 
        w._id === id ? { ...w, status: newStatus } : w
      )
    );
  };

  // Statistiques
  const stats = {
    total: withdraws.length,
    pending: withdraws.filter(w => w.status === 'PENDING').length,
    approved: withdraws.filter(w => w.status === 'OK').length,
    rejected: withdraws.filter(w => w.status === 'NO').length,
    totalAmount: withdraws.reduce((sum, w) => sum + w.montant, 0),
    pendingAmount: withdraws.filter(w => w.status === 'PENDING').reduce((sum, w) => sum + w.montant, 0)
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des retraits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchWithdraws}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* En-tête */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Retraits</h2>
        <p className="text-gray-600">Validez ou rejetez les demandes de retrait</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Approuvés</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejetés</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">${stats.totalAmount.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Montant total</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">${stats.pendingAmount.toFixed(0)}</div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, matricule, référence, n° commande..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filtre par statut */}
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par statut
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="OK">Approuvés</option>
              <option value="NO">Rejetés</option>
            </select>
          </div>
          
          {/* Bouton actualiser */}
          <div className="flex items-end">
            <button
              onClick={fetchWithdraws}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Grille de cartes */}
      {filteredWithdraws.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun retrait trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'Aucun retrait ne correspond à vos critères de recherche'
              : 'Aucune demande de retrait disponible'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWithdraws.map((withdraw) => (
            <WithdrawCard
              key={withdraw._id}
              withdraw={withdraw}
              onStatusUpdate={handleStatusUpdate}
              onWithdrawUpdate={fetchWithdraws}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WithdrawManagement;