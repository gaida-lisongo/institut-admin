'use client';

import React, { useState, useEffect } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import useAuthStore from '@/stores/authStore';
import TransactionService from '@/services/TransactionService';
import type { Withdraw, WithdrawAgent } from '@/services/TransactionService';

const RetraitsPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading, error, createWithdraw, clearError } = useTransactionStore();
  
  // État local pour les retraits avec informations agent
  const [withdrawsAgent, setWithdrawsAgent] = useState<WithdrawAgent[]>([]);
  const [isLoadingWithdraws, setIsLoadingWithdraws] = useState(false);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    montant: '',
    phoneNumber: '',
    reference: '',
    description: ''
  });
  
  // État pour la validation
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Charger les retraits au montage du composant
  const fetchWithdrawsAgent = async () => {
    if (!user?._id) return;
    
    setIsLoadingWithdraws(true);
    try {
      // Pour l'instant, on utilise la méthode existante et on simule les données agent
      const result = await TransactionService.getWithdrawsByUserId(user._id);
      if (result.success && result.data) {
        // Transformation temporaire des données Withdraw en WithdrawAgent
        const withdrawsWithAgent = (result.data as WithdrawAgent[]).map(withdraw => ({
          ...withdraw,
          userId: {
            _id: user._id || '',
            photo: user.photo || '/images/user/default-avatar.png',
            nom: user.nom || 'Utilisateur',
            matricule: user.matricule || 'N/A',
            telephone: user.telephone
          }
        } as WithdrawAgent));
        
        setWithdrawsAgent(withdrawsWithAgent);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des retraits:', error);
    } finally {
      setIsLoadingWithdraws(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWithdrawsAgent();
    }
  }, [isAuthenticated, user]);

  // Gérer les changements du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer les erreurs quand l'utilisateur modifie les champs
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      errors.push('Le montant doit être supérieur à 0');
    }
    
    if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
      errors.push('Le numéro de téléphone est requis');
    }
    
    // Validation du format du téléphone
    const formattedPhone = TransactionService.formatPhoneNumber(formData.phoneNumber);
    if (!formattedPhone) {
      errors.push('Format de numéro de téléphone invalide');
    }
    
    if (!formData.reference || formData.reference.trim() === '') {
      errors.push('La référence est requise');
    }
    
    setFormErrors(errors);
    return errors.length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setFormErrors(['Utilisateur non connecté']);
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    clearError();
    
    try {
      const withdrawData: Omit<Withdraw, '_id' | 'createdAt' | 'updatedAt'> = {
        userId: user._id!,
        montant: parseFloat(formData.montant),
        orderNumber: TransactionService.generateOrderNumber(),
        reference: formData.reference,
        description: formData.description,
        phoneNumber: TransactionService.formatPhoneNumber(formData.phoneNumber)!,
        status: 'PENDING'
      };
      
      const success = await createWithdraw(withdrawData);
      
      if (success) {
        setSubmitSuccess(true);
        setFormData({
          montant: '',
          phoneNumber: '',
          reference: '',
          description: ''
        });
        // Recharger les retraits après création
        await fetchWithdrawsAgent();
      }
    } catch (error) {
      console.error('Erreur lors de la création du retrait:', error);
      setFormErrors(['Erreur lors de la soumission de la demande']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      montant: '',
      phoneNumber: '',
      reference: '',
      description: ''
    });
    setFormErrors([]);
    setSubmitSuccess(false);
    clearError();
  };

  // Formatage de la date
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

  // Formatage du statut
  const formatStatus = (status: string) => {
    const statusMap = {
      'PENDING': { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      'OK': { label: 'Approuvé', color: 'bg-green-100 text-green-800' },
      'NO': { label: 'Rejeté', color: 'bg-red-100 text-red-800' }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600">Veuillez vous connecter pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Demandes de Retrait</h1>
        <p className="text-gray-600">Gérez vos demandes de retrait de fonds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire de demande de retrait */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Nouvelle Demande de Retrait</h2>
          
          {/* Messages d'erreur */}
          {formErrors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreurs de validation :</h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Message de succès */}
          {submitSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Demande de retrait soumise avec succès !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Erreur du store */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Montant */}
            <div>
              <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-2">
                Montant (CDF) *
              </label>
              <input
                type="number"
                id="montant"
                name="montant"
                value={formData.montant}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrez le montant à retirer"
                required
              />
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 0900000000"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Format accepté : 243XXXXXXXXX ou 0XXXXXXXXX
              </p>
            </div>

            {/* Référence */}
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                Référence *
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Référence de la transaction"
                required
              />
            </div>

            {/* Description (optionnel) */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description de la demande de retrait..."
              />
            </div>

            {/* Boutons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Soumission...' : 'Soumettre la demande'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>

        {/* Liste des demandes existantes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes Demandes de Retrait</h2>
          
          {isLoadingWithdraws ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Chargement...</span>
            </div>
          ) : withdrawsAgent.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande de retrait</h3>
              <p className="mt-1 text-sm text-gray-500">Vous n'avez pas encore fait de demande de retrait.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-150 overflow-y-auto">
              {withdrawsAgent.map((withdraw) => (
                <div key={withdraw._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* En-tête avec photo et statut */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {/* Photo de l'agent */}
                      <div className="relative">
                        <img
                          src={withdraw.userId.photo || '/images/user/default-avatar.png'}
                          alt={withdraw.userId.nom}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/user/default-avatar.png';
                          }}
                        />
                      </div>
                      
                      {/* Informations de base */}
                      <div>
                        <h4 className="font-semibold text-gray-900">{withdraw.userId.nom}</h4>
                        <p className="text-sm text-gray-600">Mat: {withdraw.userId.matricule}</p>
                      </div>
                    </div>
                    
                    {/* Badge de statut avec couleurs */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${formatStatus(withdraw.status).color}`}>
                      {formatStatus(withdraw.status).label}
                    </span>
                  </div>
                  
                  {/* Montant principal */}
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {withdraw.montant.toFixed(2)} CDF
                    </div>
                  </div>
                  
                  {/* Détails de la transaction */}
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="font-medium">Référence:</span>
                      <span className="text-gray-900">{withdraw.reference}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Numéro de commande:</span>
                      <span className="text-gray-900 break-all">{withdraw.orderNumber}</span>
                    </div>
                    
                    {withdraw.phoneNumber && (
                      <div className="flex justify-between">
                        <span className="font-medium">Téléphone:</span>
                        <span className="text-gray-900">{withdraw.phoneNumber}</span>
                      </div>
                    )}
                    
                    {withdraw.description && (
                      <div className="mt-2">
                        <span className="font-medium">Description:</span>
                        <p className="text-gray-900 mt-1">{withdraw.description}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="font-medium">Date de demande:</span>
                      <span className="text-gray-900">{formatDate(withdraw.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetraitsPage;
