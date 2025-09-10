"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useTransactionStore } from "../../stores/transactionStore";
import type { Deposit, Withdraw } from "../../services/TransactionService";

// Types pour les transactions combinées
type TransactionType = 'deposit' | 'withdraw';
type TransactionStatus = 'NO' | 'PENDING' | 'OK';

interface CombinedTransaction {
  _id: string;
  userId: string;
  montant: number;
  orderNumber: string;
  reference: string;
  status: TransactionStatus;
  type: TransactionType;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  search: string;
  type: TransactionType | 'all';
  status: TransactionStatus | 'all';
}

export default function TransactionManager() {
  const {
    deposits,
    withdraws,
    isLoading,
    error,
    fetchDeposits,
    fetchWithdraws,
    updateDeposit,
    updateWithdraw,
    deleteDeposit,
    deleteWithdraw,
    clearError
  } = useTransactionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CombinedTransaction | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'withdraw', // Par défaut on montre les retraits
    status: 'all'
  });

  // Charger les données au montage
  useEffect(() => {
    fetchDeposits();
    fetchWithdraws();
  }, [fetchDeposits, fetchWithdraws]);

  // Combiner et filtrer les transactions
  const getCombinedTransactions = (): CombinedTransaction[] => {
    let combined: CombinedTransaction[] = [];

    // Ajouter les dépôts
    if (filters.type === 'all' || filters.type === 'deposit') {
      combined = [...combined, ...deposits.map(d => ({
        ...d,
        type: 'deposit' as TransactionType,
        _id: d._id!,
        createdAt: d.createdAt!,
        updatedAt: d.updatedAt!
      }))];
    }

    // Ajouter les retraits
    if (filters.type === 'all' || filters.type === 'withdraw') {
      combined = [...combined, ...withdraws.map(w => ({
        ...w,
        type: 'withdraw' as TransactionType,
        _id: w._id!,
        createdAt: w.createdAt!,
        updatedAt: w.updatedAt!
      }))];
    }

    // Filtrer par recherche
    if (filters.search) {
      combined = combined.filter(t => 
        t.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.reference.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.userId.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtrer par statut
    if (filters.status !== 'all') {
      combined = combined.filter(t => t.status === filters.status);
    }

    // Trier par date (plus récent en premier)
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Mettre à jour le statut d'une transaction
  const handleStatusUpdate = async (transaction: CombinedTransaction, newStatus: TransactionStatus) => {
    try {
      let success = false;
      if (transaction.type === 'deposit') {
        success = await updateDeposit(transaction._id, { status: newStatus });
      } else {
        success = await updateWithdraw(transaction._id, { status: newStatus });
      }

      if (success) {
        clearError();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  // Supprimer une transaction
  const handleDelete = async (transaction: CombinedTransaction) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cette ${transaction.type === 'deposit' ? 'dépôt' : 'retrait'} ?`)) {
      return;
    }

    try {
      let success = false;
      if (transaction.type === 'deposit') {
        success = await deleteDeposit(transaction._id);
      } else {
        success = await deleteWithdraw(transaction._id);
      }

      if (success) {
        clearError();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusColor = (status: TransactionStatus): "success" | "warning" | "error" => {
    switch (status) {
      case 'OK': return 'success';
      case 'PENDING': return 'warning';
      case 'NO': return 'error';
      default: return 'warning';
    }
  };

  // Obtenir le label du statut
  const getStatusLabel = (status: TransactionStatus): string => {
    switch (status) {
      case 'OK': return 'Approuvé';
      case 'PENDING': return 'En attente';
      case 'NO': return 'Rejeté';
      default: return status;
    }
  };

  const combinedTransactions = getCombinedTransactions();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Chargement des transactions...</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Transactions
            </h3>
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher par numéro de commande, référence ou utilisateur..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          {/* Filtre par type */}
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as TransactionType | 'all' }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">Toutes les transactions</option>
            <option value="deposit">Dépôts uniquement</option>
            <option value="withdraw">Retraits uniquement</option>
          </select>

          {/* Filtre par statut */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as TransactionStatus | 'all' }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="OK">Approuvé</option>
            <option value="NO">Rejeté</option>
          </select>

          {/* Bouton actualiser */}
          <button
            onClick={() => {
              fetchDeposits();
              fetchWithdraws();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Type
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Numéro de commande
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Référence
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Montant
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Utilisateur
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Statut
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Date
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {combinedTransactions.map((transaction) => (
              <TableRow key={`${transaction.type}-${transaction._id}`}>
                <TableCell className="py-3">
                  <Badge
                    size="sm"
                    color={transaction.type === 'deposit' ? 'success' : 'warning'}
                  >
                    {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 font-medium text-gray-800 text-sm dark:text-white/90">
                  {transaction.orderNumber}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {transaction.reference}
                </TableCell>
                <TableCell className="py-3 font-semibold text-gray-800 text-sm dark:text-white/90">
                  {formatAmount(transaction.montant)}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {transaction.userId.slice(-8)}...
                </TableCell>
                <TableCell className="py-3">
                  <select
                    value={transaction.status}
                    onChange={(e) => handleStatusUpdate(transaction, e.target.value as TransactionStatus)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="PENDING">En attente</option>
                    <option value="OK">Approuvé</option>
                    <option value="NO">Rejeté</option>
                  </select>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-xs dark:text-gray-400">
                  {formatDate(transaction.createdAt)}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(transaction)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {combinedTransactions.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            {filters.search || filters.type !== 'all' || filters.status !== 'all' 
              ? 'Aucune transaction trouvée avec ces filtres'
              : 'Aucune transaction disponible'
            }
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {combinedTransactions.filter(t => t.type === 'deposit').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Dépôts</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {combinedTransactions.filter(t => t.type === 'withdraw').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Retraits</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {combinedTransactions.filter(t => t.status === 'PENDING').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">En attente</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {combinedTransactions.filter(t => t.status === 'OK').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Approuvés</div>
          </div>
        </div>
      </div>
    </div>
  );
}
