import React, { useState } from 'react';
import { useSectionStore } from '../../stores/sectionStore';
import type { Contact, Section } from '../../stores/sectionStore';
import ComponentCard from '../common/ComponentCard';

const SectionContacts: React.FC = () => {
  const { sections, updateContactInSection, isLoading, error } = useSectionStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Contact | null>(null);
  const [saving, setSaving] = useState(false);

  const handleEdit = (section: Section) => {
    setEditId(section._id || null);
    setForm(section.contact);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (sectionId: string) => {
    if (!form) return;
    setSaving(true);
    const success = await updateContactInSection(sectionId, form);
    setSaving(false);
    if (success) {
      setEditId(null);
      setForm(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Gestion des contacts des sections</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {sections.length === 0 && <div>Aucune section trouvée.</div>}
      {sections.map(section => (
        <ComponentCard key={section._id} title={section.description.sigle} className="w-full">
          {editId === section._id ? (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-sm font-medium mb-1">Adresse</label>
                <input name="addresse" value={form?.addresse || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <input name="telephone" value={form?.telephone || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" value={form?.email || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site web</label>
                <input name="www" value={form?.www || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="col-span-2 flex gap-2 mt-2">
                <button type="button" onClick={() => handleSave(section._id!)} disabled={isLoading || saving} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button type="button" onClick={() => { setEditId(null); setForm(null); }} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Annuler</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div>
                <span className="block text-sm font-medium text-gray-500">Adresse</span>
                <span className="block text-base">{section.contact.addresse}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">Téléphone</span>
                <span className="block text-base">{section.contact.telephone}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">Email</span>
                <span className="block text-base">{section.contact.email}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">Site web</span>
                <span className="block text-base">{section.contact.www || '-'}</span>
              </div>
              <div className="col-span-2 flex gap-2 mt-2">
                <button type="button" onClick={() => handleEdit(section)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Modifier</button>
              </div>
            </div>
          )}
        </ComponentCard>
      ))}
    </div>
  );
};

export default SectionContacts;
