'use client';

import { useState, useEffect } from 'react';

interface Contact {
  id: number;
  name: string;
  email: string;
  title?: string;
  role?: string;
  company?: string;
  linkedinUrl?: string;
  notes?: string;
}

interface ContactFormProps {
  dealId: number;
  contact?: Contact | null;
  onSave: (data: Omit<Contact, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ROLE_OPTIONS = [
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'economic_buyer', label: 'Economic Buyer' },
  { value: 'technical_buyer', label: 'Technical Buyer' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'end_user', label: 'End User' },
];

export function ContactForm({ dealId, contact, onSave, onCancel, isLoading }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    title: contact?.title || '',
    role: contact?.role || '',
    company: contact?.company || '',
    linkedinUrl: contact?.linkedinUrl || '',
    notes: contact?.notes || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData as Omit<Contact, 'id'>);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red rounded-lg text-sm text-red">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Full name"
          className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Email *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="name@company.com"
          className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., VP Engineering"
          className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Role in Deal</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
        >
          <option value="">Select a role...</option>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Company</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          placeholder="Company name"
          className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">LinkedIn URL</label>
        <input
          type="url"
          value={formData.linkedinUrl}
          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
          placeholder="https://linkedin.com/in/..."
          className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any notes about this contact..."
          rows={3}
          className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt resize-none"
        />
      </div>

      <div className="flex gap-2 pt-4 border-t border-line">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-line text-ink text-sm hover:bg-paper-alt transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || isLoading}
          className="px-4 py-2 rounded-lg bg-cobalt text-white text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? 'Saving...' : contact ? 'Update Contact' : 'Add Contact'}
        </button>
      </div>
    </form>
  );
}
