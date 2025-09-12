"use client";

import { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { useTransactionStore } from "../../stores/transactionStore";
import TransactionService from "../../services/TransactionService";
import type { WithdrawAgent } from "../../services/TransactionService";
import { useAgentStore } from "@/stores/agentStore";

// Types pour les transactions combinées
type TransactionType = 'deposit' | 'withdraw';
type TransactionStatus = 'NO' | 'PENDING' | 'OK';

interface CombinedTransaction {
  _id: string;
  userId: string | {
    _id: string;
    photo: string;
    nom: string;
    matricule: string;
    telephone?: string;
  };
  montant: number;
  orderNumber: string;
  reference: string;
  status: TransactionStatus;
  type: TransactionType;
  createdAt: string;
  updatedAt: string;
  description?: string;
  phoneNumber?: string;
}

interface FilterState {
  search: string;
  type: TransactionType | 'all';
  status: TransactionStatus | 'all';
}

export default function RecentOrders() {
  const {
    deposits,
    isLoading,
    error,
    fetchDeposits,
    updateDeposit,
    updateWithdraw,
    deleteDeposit,
    deleteWithdraw,
    clearError
  } = useTransactionStore();
  const {
    creditSolde
  } = useAgentStore();

  // État local pour les retraits avec informations agent
  const [withdrawsAgent, setWithdrawsAgent] = useState<WithdrawAgent[]>([]);
  const [isLoadingWithdraws, setIsLoadingWithdraws] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'withdraw',
    status: 'all'
  });

  // Charger les retraits avec informations agent
  const fetchWithdrawsAgent = async () => {
    setIsLoadingWithdraws(true);
    try {
      const result = await TransactionService.getAllWithdraws();
      if (result.success && result.data) {
        const data = result.data as any[];
        
        if (data.length === 0) {
          setWithdrawsAgent([]);
          return;
        }
        
        if (typeof data[0].userId === 'object' && data[0].userId !== null) {
          setWithdrawsAgent(data as WithdrawAgent[]);
        } else {
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
          
          setWithdrawsAgent(withdrawsWithAgent);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des retraits:', error);
    } finally {
      setIsLoadingWithdraws(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
    fetchWithdrawsAgent();
  }, [fetchDeposits]);

  // Combiner et filtrer les transactions
  const getCombinedTransactions = (): CombinedTransaction[] => {
    let combined: CombinedTransaction[] = [];

    if (filters.type === 'all' || filters.type === 'deposit') {
      combined = [...combined, ...deposits.map(d => ({
        ...d,
        type: 'deposit' as TransactionType,
        _id: d._id!,
        createdAt: d.createdAt!,
        updatedAt: d.updatedAt!
      }))];
    }

    if (filters.type === 'all' || filters.type === 'withdraw') {
      combined = [...combined, ...withdrawsAgent.map(w => ({
        ...w,
        type: 'withdraw' as TransactionType,
        _id: w._id!,
        createdAt: w.createdAt!,
        updatedAt: w.updatedAt!
      }))];
    }

    if (filters.search) {
      combined = combined.filter(t => {
        const searchTerm = filters.search.toLowerCase();
        const orderMatch = t.orderNumber.toLowerCase().includes(searchTerm);
        const refMatch = t.reference.toLowerCase().includes(searchTerm);
        
        let userMatch = false;
        if (typeof t.userId === 'string') {
          userMatch = t.userId.toLowerCase().includes(searchTerm);
        } else {
          userMatch = t.userId.nom.toLowerCase().includes(searchTerm) ||
                     t.userId.matricule.toLowerCase().includes(searchTerm);
        }
        
        return orderMatch || refMatch || userMatch;
      });
    }

    if (filters.status !== 'all') {
      combined = combined.filter(t => t.status === filters.status);
    }

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
        setWithdrawsAgent(prev => 
          prev.map(w => 
            w._id === transaction._id ? { ...w, status: newStatus } : w
          )
        );
      }

      if (success && newStatus === 'OK') {
        console.log("Current Transaction = ", transaction);
        const payload = {
          id: typeof transaction.userId === 'string' ? transaction.userId : transaction.userId._id,
          montant: transaction.montant
        }
        await creditSolde(payload.id, payload.montant);
        generateReceipt(transaction);
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
        setWithdrawsAgent(prev => prev.filter(w => w._id !== transaction._id));
      }

      if (success) {
        clearError();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Générer un reçu PDF
  const generateReceipt = async (transaction: CombinedTransaction) => {
    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Configuration des couleurs
      const primaryColor = [41, 128, 185]; // Bleu professionnel
      const secondaryColor = [52, 73, 94]; // Gris foncé
      const accentColor = [46, 204, 113]; // Vert pour succès
      
      // Fonction pour convertir image en base64
      const getImageBase64 = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            resolve(dataURL);
          };
          img.onerror = () => resolve(''); // Retourner une chaîne vide en cas d'erreur
          img.src = url;
        });
      };
      
      // En-tête avec couleur de fond
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 50, 'F');
      
      // Logo et titre
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('INSTITUT ADMINISTRATION', 105, 25, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('REÇU OFFICIEL DE TRANSACTION', 105, 35, { align: 'center' });
      
      // Réinitialiser la couleur du texte
      doc.setTextColor(0, 0, 0);
      
      // Informations du reçu
      let yPos = 65;
      doc.setFillColor(248, 249, 250);
      doc.rect(15, yPos - 5, 180, 25, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('DÉTAILS DE LA TRANSACTION', 20, yPos + 5);
      
      // Badge de statut
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(150, yPos - 3, 40, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('VALIDÉ', 170, yPos + 5, { align: 'center' });
      
      // Réinitialiser pour le contenu
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      yPos += 25;
      
      // Contenu principal dans un tableau stylé
      const leftColumn = 20;
      const rightColumn = 110;
      
      // Type et montant (ligne importante)
      doc.setFillColor(252, 248, 227);
      doc.rect(15, yPos, 180, 20, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Type de transaction:', leftColumn, yPos + 7);
      doc.text(`${transaction.type === 'deposit' ? 'DÉPÔT' : 'RETRAIT'}`, leftColumn, yPos + 14);
      
      doc.text('Montant:', rightColumn, yPos + 7);
      doc.setFontSize(16);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`${transaction.montant.toLocaleString('fr-CD')} CDF`, rightColumn, yPos + 14);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      yPos += 30;
      
      // Autres détails
      doc.text('Numéro de commande:', leftColumn, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(transaction.orderNumber, rightColumn, yPos);
      doc.setFont('helvetica', 'normal');
      
      yPos += 10;
      doc.text('Référence:', leftColumn, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(transaction.reference, rightColumn, yPos);
      doc.setFont('helvetica', 'normal');
      
      yPos += 10;
      doc.text('Date de transaction:', leftColumn, yPos);
      doc.text(formatDate(transaction.createdAt), rightColumn, yPos);
      
      // Informations utilisateur avec photo
      if (typeof transaction.userId === 'object') {
        yPos += 25;
        doc.setFillColor(248, 249, 250);
        doc.rect(15, yPos - 5, 180, 45, 'F');
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('INFORMATIONS UTILISATEUR', 20, yPos + 5);
        
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        
        yPos += 15;
        doc.text('Nom complet:', leftColumn, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(transaction.userId.nom, rightColumn, yPos);
        doc.setFont('helvetica', 'normal');
        
        yPos += 10;
        doc.text('Matricule:', leftColumn, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(transaction.userId.matricule, rightColumn, yPos);
        doc.setFont('helvetica', 'normal');
        
        if (transaction.phoneNumber) {
          yPos += 10;
          doc.text('Téléphone:', leftColumn, yPos);
          doc.text(transaction.phoneNumber, rightColumn, yPos);
        }
        
        // Ajouter la photo de l'utilisateur
        try {
          if (transaction.userId.photo) {
            const imageBase64 = await getImageBase64(transaction.userId.photo);
            if (imageBase64) {
              // Dessiner un cadre pour la photo
              doc.setDrawColor(200, 200, 200);
              doc.setLineWidth(1);
              doc.rect(150, yPos - 30, 35, 35);
              
              // Ajouter l'image
              doc.addImage(imageBase64, 'JPEG', 152, yPos - 28, 31, 31);
            } else {
              // Fallback si l'image ne peut pas être chargée
              doc.setDrawColor(200, 200, 200);
              doc.rect(150, yPos - 30, 35, 35);
              doc.setFontSize(8);
              doc.text('Photo non', 167, yPos - 15, { align: 'center' });
              doc.text('disponible', 167, yPos - 10, { align: 'center' });
            }
          } else {
            // Pas de photo disponible
            doc.setDrawColor(200, 200, 200);
            doc.rect(150, yPos - 30, 35, 35);
            doc.setFontSize(8);
            doc.text('Aucune photo', 167, yPos - 15, { align: 'center' });
          }
        } catch (error) {
          console.warn('Erreur lors du chargement de la photo:', error);
          // Zone vide en cas d'erreur
          doc.setDrawColor(200, 200, 200);
          doc.rect(150, yPos - 30, 35, 35);
          doc.setFontSize(8);
          doc.text('Photo', 167, yPos - 15, { align: 'center' });
          doc.text('indisponible', 167, yPos - 10, { align: 'center' });
        }
        
        yPos += 10;
      }
      
      // Description si présente
      if (transaction.description) {
        yPos += 25;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Description:', leftColumn, yPos);
        doc.setFont('helvetica', 'normal');
        
        yPos += 10;
        // Diviser la description en lignes si elle est trop longue
        const splitDescription = doc.splitTextToSize(transaction.description, 170);
        doc.text(splitDescription, leftColumn, yPos);
        yPos += splitDescription.length * 5;
      }
      
      // Pied de page
      yPos += 25;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(2);
      doc.line(20, yPos, 190, yPos);
      
      yPos += 15;
      doc.setFontSize(10);
      doc.text(`Date d'émission: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, yPos);
      
      // Zone de signature
      yPos += 20;
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(130, yPos + 15, 190, yPos + 15);
      doc.setFontSize(9);
      doc.text('Signature autorisée', 160, yPos + 20, { align: 'center' });
      
      // Numéro de série du reçu en bas
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Reçu n° ${transaction.orderNumber} - Généré automatiquement`, 105, 280, { align: 'center' });
      
      doc.save(`recu-${transaction.orderNumber}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du reçu:', error);
      alert('Erreur lors de la génération du reçu');
    }
  };

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
  const getStatusBadgeColor = (status: TransactionStatus): string => {
    switch (status) {
      case 'OK': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'NO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (isLoading || isLoadingWithdraws) {
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
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher par numéro de commande, référence ou utilisateur..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as TransactionType | 'all' }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">Toutes les transactions</option>
            <option value="deposit">Dépôts uniquement</option>
            <option value="withdraw">Retraits uniquement</option>
          </select>

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

          <button
            onClick={() => {
              fetchDeposits();
              fetchWithdrawsAgent();
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

      {/* Affichage en cartes optimisées */}
      <div className="space-y-3">
        {combinedTransactions.length === 0 ? (
          <div className="text-center py-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Aucune transaction trouvée</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filters.search || filters.type !== 'all' || filters.status !== 'all' 
                ? 'Aucune transaction trouvée avec ces filtres'
                : 'Aucune transaction disponible'
              }
            </p>
          </div>
        ) : (
          combinedTransactions.map((transaction) => (
            <div key={`${transaction.type}-${transaction._id}`} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-4">
                {/* En-tête de la carte compacte */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {/* Badge du type */}
                    <Badge size="sm" color={transaction.type === 'deposit' ? 'success' : 'warning'}>
                      {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                    </Badge>
                    
                    {/* Photo et infos utilisateur compactes (pour retraits uniquement) */}
                    {transaction.type === 'withdraw' && typeof transaction.userId === 'object' && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={transaction.userId.photo || '/images/user/default-avatar.png'}
                          alt={transaction.userId.nom}
                          className="w-6 h-6 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/user/default-avatar.png';
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {transaction.userId.nom}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* ID utilisateur court (pour dépôts) */}
                    {(transaction.type === 'deposit' || typeof transaction.userId === 'string') && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        ID: {typeof transaction.userId === 'string' 
                          ? `${transaction.userId.slice(-6)}...`
                          : transaction.userId._id.slice(-6)
                        }
                      </div>
                    )}
                  </div>
                  
                  {/* Montant et statut */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatAmount(transaction.montant)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    
                    {/* Statut avec bouton de validation pour PENDING */}
                    <div className="flex items-center space-x-2">
                      {transaction.status === 'PENDING' ? (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleStatusUpdate(transaction, 'OK')}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Valider
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(transaction, 'NO')}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Rejeter
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(transaction.status)}`}>
                          {getStatusLabel(transaction.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Détails de la transaction en format compact */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Commande:</span>
                    <div className="font-medium text-gray-900 dark:text-white text-xs break-all">
                      {transaction.orderNumber}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Référence:</span>
                    <div className="text-gray-900 dark:text-white text-xs">
                      {transaction.reference}
                    </div>
                  </div>
                  
                  {transaction.phoneNumber && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Téléphone:</span>
                      <div className="text-gray-900 dark:text-white text-xs">
                        {transaction.phoneNumber}
                      </div>
                    </div>
                  )}
                  
                  {typeof transaction.userId === 'object' && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Matricule:</span>
                      <div className="text-gray-900 dark:text-white text-xs">
                        {transaction.userId.matricule}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Description si présente (compacte) */}
                {transaction.description && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Description:</span>
                    <div className="text-sm text-gray-900 dark:text-white truncate">
                      {transaction.description}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    {transaction.status === 'OK' && (
                      <button
                        onClick={() => generateReceipt(transaction)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        Télécharger le reçu
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDelete(transaction)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistiques */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
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
