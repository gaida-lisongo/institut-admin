"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Question, CreateQuestionData } from '@/types/session';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: CreateQuestionData) => void;
  question?: Question | null;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  question,
}) => {
  const [formData, setFormData] = useState({
    enonce: [''],
    choix: ['', '', '', ''],
    reponse: 0,
    pts: 1,
  });

  useEffect(() => {
    if (question) {
      setFormData({
        enonce: question.enonce.length > 0 ? question.enonce : [''],
        choix: question.choix.length >= 4 ? question.choix : [...question.choix, ...Array(4 - question.choix.length).fill('')],
        reponse: question.reponse,
        pts: question.pts,
      });
    } else {
      setFormData({
        enonce: [''],
        choix: ['', '', '', ''],
        reponse: 0,
        pts: 1,
      });
    }
  }, [question, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const validEnonce = formData.enonce.filter(line => line.trim() !== '');
    const validChoix = formData.choix.filter(choix => choix.trim() !== '');
    
    if (validEnonce.length === 0) {
      alert('Veuillez saisir au moins une ligne d\'énoncé');
      return;
    }
    
    if (validChoix.length < 2) {
      alert('Veuillez saisir au moins 2 choix de réponse');
      return;
    }
    
    if (formData.reponse >= validChoix.length) {
      alert('L\'index de la bonne réponse est invalide');
      return;
    }
    
    if (formData.pts <= 0) {
      alert('Le nombre de points doit être supérieur à 0');
      return;
    }

    const questionData: CreateQuestionData = {
      enonce: validEnonce,
      choix: validChoix,
      reponse: formData.reponse,
      pts: formData.pts,
    };

    onSubmit(questionData);
    onClose();
  };

  const handleEnonceChange = (index: number, value: string) => {
    const newEnonce = [...formData.enonce];
    newEnonce[index] = value;
    setFormData(prev => ({ ...prev, enonce: newEnonce }));
  };

  const addEnonceeLine = () => {
    setFormData(prev => ({ ...prev, enonce: [...prev.enonce, ''] }));
  };

  const removeEnonceeLine = (index: number) => {
    if (formData.enonce.length > 1) {
      const newEnonce = formData.enonce.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, enonce: newEnonce }));
    }
  };

  const handleChoixChange = (index: number, value: string) => {
    const newChoix = [...formData.choix];
    newChoix[index] = value;
    setFormData(prev => ({ ...prev, choix: newChoix }));
  };

  const addChoix = () => {
    setFormData(prev => ({ ...prev, choix: [...prev.choix, ''] }));
  };

  const removeChoix = (index: number) => {
    if (formData.choix.length > 2) {
      const newChoix = formData.choix.filter((_, i) => i !== index);
      // Ajuster l'index de la bonne réponse si nécessaire
      let newReponse = formData.reponse;
      if (index === formData.reponse) {
        newReponse = 0;
      } else if (index < formData.reponse) {
        newReponse = formData.reponse - 1;
      }
      setFormData(prev => ({ ...prev, choix: newChoix, reponse: newReponse }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {question ? 'Modifier la question' : 'Ajouter une question'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {question 
              ? 'Modifiez les détails de la question'
              : 'Créez une nouvelle question pour cette session'
            }
          </p>
        </div>

        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Énoncé */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Énoncé de la question
            </label>
            {formData.enonce.map((line, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={line}
                  onChange={(e) => handleEnonceChange(index, e.target.value)}
                  className="flex-1 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder={`Ligne ${index + 1} de l'énoncé`}
                  required={index === 0}
                />
                {formData.enonce.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEnonceeLine(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addEnonceeLine}
              className="mt-2 text-sm text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
            >
              + Ajouter une ligne
            </button>
          </div>

          {/* Choix de réponses */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Choix de réponses
            </label>
            {formData.choix.map((choix, index) => (
              <div key={index} className="mb-2 flex gap-2 items-center">
                <input
                  type="radio"
                  name="bonne-reponse"
                  checked={formData.reponse === index}
                  onChange={() => setFormData(prev => ({ ...prev, reponse: index }))}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-700"
                />
                <input
                  type="text"
                  value={choix}
                  onChange={(e) => handleChoixChange(index, e.target.value)}
                  className="flex-1 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder={`Choix ${index + 1}`}
                  required={index < 2}
                />
                {formData.choix.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeChoix(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addChoix}
              className="mt-2 text-sm text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
            >
              + Ajouter un choix
            </button>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Sélectionnez la bonne réponse en cochant le bouton radio correspondant
            </p>
          </div>

          {/* Points */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Points attribués
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={formData.pts}
              onChange={(e) => setFormData(prev => ({ ...prev, pts: parseFloat(e.target.value) || 1 }))}
              className="h-11 w-32 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            {question ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QuestionModal;
