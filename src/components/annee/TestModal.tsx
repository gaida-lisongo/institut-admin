'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AnneeModal from './AnneeModal';

export default function TestModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test du Modal AnneeModal</h2>
      
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ouvrir le Modal de Test
      </button>

      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          État du modal : {isModalOpen ? 'Ouvert' : 'Fermé'}
        </p>
      </div>

      <AnneeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="create"
      />
    </div>
  );
}
