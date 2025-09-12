'use client';

import React, { useState, useEffect } from 'react';
import TransactionService from '@/services/TransactionService';
import type { WithdrawAgent } from '@/services/TransactionService';
import jsPDF from 'jspdf';

interface WithdrawCardProps {
  withdraw: WithdrawAgent;
  onStatusUpdate?: (id: string, newStatus: 'OK' | 'NO') => void;
  onWithdrawUpdate?: () => void;
}

const WithdrawCard: React.FC<WithdrawCardProps> = ({ 
  withdraw, 
  onStatusUpdate, 
  onWithdrawUpdate 
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Valider un retrait
  const handleValidate = async () => {
    if (!withdraw._id) return;
    
    setIsValidating(true);
    try {
      const result = await TransactionService.updateWithdraw(withdraw._id, {
        status: 'OK'
      });
      
      if (result.success) {
        // Générer automatiquement le reçu PDF après validation
        await generateReceipt();
        
        if (onStatusUpdate) {
          onStatusUpdate(withdraw._id, 'OK');
        }
        if (onWithdrawUpdate) {
          onWithdrawUpdate();
        }
      } else {
        alert('Erreur lors de la validation du retrait');
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation du retrait');
    } finally {
      setIsValidating(false);
    }
  };

  // Rejeter un retrait
  const handleReject = async () => {
    if (!withdraw._id) return;
    
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande de retrait ?')) {
      return;
    }
    
    setIsValidating(true);
    try {
      const result = await TransactionService.updateWithdraw(withdraw._id, {
        status: 'NO'
      });
      
      if (result.success) {
        if (onStatusUpdate) {
          onStatusUpdate(withdraw._id, 'NO');
        }
        if (onWithdrawUpdate) {
          onWithdrawUpdate();
        }
      } else {
        alert('Erreur lors du rejet du retrait');
      }
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet du retrait');
    } finally {
      setIsValidating(false);
    }
  };

  // Générer le reçu PDF
  const generateReceipt = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF();
      
      // Configuration du PDF
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      
      // En-tête
      pdf.text('REÇU DE RETRAIT VALIDÉ', 105, 30, { align: 'center' });
      
      // Ligne de séparation
      pdf.setLineWidth(0.5);
      pdf.line(20, 40, 190, 40);
      
      // Informations du retrait
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      let yPosition = 60;
      const lineHeight = 10;
      
      // Informations de l'agent
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMATIONS DE L\'AGENT:', 20, yPosition);
      yPosition += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Nom: ${withdraw.userId.nom}`, 20, yPosition);
      yPosition += lineHeight;
      
      pdf.text(`Matricule: ${withdraw.userId.matricule}`, 20, yPosition);
      yPosition += lineHeight;
      
      if (withdraw.userId.telephone) {
        pdf.text(`Téléphone: ${withdraw.userId.telephone}`, 20, yPosition);
        yPosition += lineHeight;
      }
      
      yPosition += 5;
      
      // Informations de la transaction
      pdf.setFont('helvetica', 'bold');
      pdf.text('DÉTAILS DE LA TRANSACTION:', 20, yPosition);
      yPosition += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Montant: $${withdraw.montant.toFixed(2)} USD`, 20, yPosition);
      yPosition += lineHeight;
      
      pdf.text(`Référence: ${withdraw.reference}`, 20, yPosition);
      yPosition += lineHeight;
      
      pdf.text(`Numéro de commande: ${withdraw.orderNumber}`, 20, yPosition);
      yPosition += lineHeight;
      
      if (withdraw.phoneNumber) {
        pdf.text(`Numéro de retrait: ${withdraw.phoneNumber}`, 20, yPosition);
        yPosition += lineHeight;
      }
      
      if (withdraw.description) {
        pdf.text(`Description: ${withdraw.description}`, 20, yPosition);
        yPosition += lineHeight;
      }
      
      yPosition += 5;
      
      // Informations de validation
      pdf.setFont('helvetica', 'bold');
      pdf.text('VALIDATION:', 20, yPosition);
      yPosition += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Statut: APPROUVÉ`, 20, yPosition);
      yPosition += lineHeight;
      
      pdf.text(`Date de création: ${formatDate(withdraw.createdAt)}`, 20, yPosition);
      yPosition += lineHeight;
      
      pdf.text(`Date de validation: ${formatDate(new Date().toISOString())}`, 20, yPosition);
      yPosition += lineHeight;
      
      // Pied de page
      yPosition += 20;
      pdf.setLineWidth(0.5);
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Ce reçu certifie que la demande de retrait a été validée et approuvée.', 105, yPosition, { align: 'center' });
      yPosition += 10;
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, yPosition, { align: 'center' });
      
      // Télécharger le PDF
      const fileName = `recu_retrait_${withdraw.orderNumber}_${Date.now()}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du reçu PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Statut avec couleurs
  const getStatusDisplay = () => {
    switch (withdraw.status) {
      case 'PENDING':
        return {
          label: 'En attente',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'OK':
        return {
          label: 'Approuvé',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'NO':
        return {
          label: 'Rejeté',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          label: withdraw.status,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* En-tête de la carte */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Photo de l'agent */}
          <img
            src={withdraw.userId.photo || '/images/user/default-avatar.png'}
            alt={withdraw.userId.nom}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/user/default-avatar.png';
            }}
          />
          
          {/* Informations de l'agent */}
          <div>
            <h3 className="font-semibold text-gray-900">{withdraw.userId.nom}</h3>
            <p className="text-sm text-gray-600">Mat: {withdraw.userId.matricule}</p>
          </div>
        </div>
        
        {/* Badge de statut */}
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusDisplay.className}`}>
          {statusDisplay.label}
        </span>
      </div>
      
      {/* Montant principal */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900">
          ${withdraw.montant.toFixed(2)}
        </div>
        <p className="text-sm text-gray-600">Montant demandé</p>
      </div>
      
      {/* Détails de la transaction */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Référence:</span>
            <span className="font-medium text-gray-900">{withdraw.reference}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">N° Commande:</span>
            <span className="font-medium text-gray-900 break-all">{withdraw.orderNumber}</span>
          </div>
          
          {withdraw.phoneNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">Téléphone:</span>
              <span className="font-medium text-gray-900">{withdraw.phoneNumber}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-900">{formatDate(withdraw.createdAt)}</span>
          </div>
        </div>
        
        {withdraw.description && (
          <div className="pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Description:</span>
            <p className="text-sm text-gray-900 mt-1">{withdraw.description}</p>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex space-x-3">
        {withdraw.status === 'PENDING' && (
          <>
            <button
              onClick={handleValidate}
              disabled={isValidating}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isValidating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validation...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Valider
                </>
              )}
            </button>
            
            <button
              onClick={handleReject}
              disabled={isValidating}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rejeter
            </button>
          </>
        )}
        
        {withdraw.status === 'OK' && (
          <button
            onClick={generateReceipt}
            disabled={isGeneratingPDF}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGeneratingPDF ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Génération...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Télécharger Reçu PDF
              </>
            )}
          </button>
        )}
        
        {withdraw.status === 'NO' && (
          <div className="w-full text-center py-2 text-red-600 font-medium">
            Demande rejetée
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawCard;