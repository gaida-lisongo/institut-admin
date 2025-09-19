import React from "react";

interface ModalConfirmProps {
  open: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ModalConfirm({ open, message, onClose, onConfirm, loading }: ModalConfirmProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div className="mb-4 text-lg text-gray-800 dark:text-gray-100">{message}</div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            {loading ? "Suppression..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
