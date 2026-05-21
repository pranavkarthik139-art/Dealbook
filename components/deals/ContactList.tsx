'use client';

import { useState } from 'react';
import { LogEngagementModal } from './LogEngagementModal';

interface Contact {
  id: number;
  name: string;
  email: string;
  title?: string;
  role?: string;
  linkedinUrl?: string;
  lastContactedAt?: string;
}

interface ContactListProps {
  dealId: number;
  contacts: Contact[];
  primaryContactEmail?: string;
  onAdd: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: number) => Promise<void>;
  onEngagementLogged?: () => void;
  isLoading?: boolean;
}

export function ContactList({
  dealId,
  contacts,
  primaryContactEmail,
  onAdd,
  onEdit,
  onDelete,
  onEngagementLogged,
  isLoading,
}: ContactListProps) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [loggingEngagement, setLoggingEngagement] = useState<number | null>(null);

  const handleDelete = async (contactId: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setDeleting(contactId);
      try {
        await onDelete(contactId);
      } finally {
        setDeleting(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-4 border-cobalt border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.length === 0 ? (
        <div className="text-center py-8 bg-paper-alt rounded-lg border border-line">
          <p className="text-ink-lighter text-sm mb-3">No contacts yet</p>
          <button
            onClick={onAdd}
            className="px-3 py-1 text-xs rounded-lg bg-cobalt text-white hover:opacity-90"
          >
            + Add Contact
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 rounded-lg border ${
                  primaryContactEmail === contact.email
                    ? 'border-cobalt bg-blue-50'
                    : 'border-line bg-white'
                } hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-ink">{contact.name}</h4>
                      {contact.role && (
                        <span className="text-xs bg-paper-alt text-ink-lighter px-2 py-0.5 rounded">
                          {contact.role.replace('_', ' ').charAt(0).toUpperCase() + contact.role.replace('_', ' ').slice(1)}
                        </span>
                      )}
                      {primaryContactEmail === contact.email && (
                        <span className="text-xs bg-cobalt text-white px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-cobalt font-mono mt-1">{contact.email}</p>
                    {contact.title && <p className="text-xs text-ink-lighter mt-1">{contact.title}</p>}
                    {contact.lastContactedAt && (
                      <p className="text-xs text-ink-lighter mt-1">
                        Last contacted: {new Date(contact.lastContactedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {contact.linkedinUrl && (
                      <a
                        href={contact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cobalt hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    <button
                      onClick={() => setLoggingEngagement(contact.id)}
                      className="text-xs text-cobalt hover:text-blue-700"
                    >
                      Log Activity
                    </button>
                    <button
                      onClick={() => onEdit(contact)}
                      className="text-xs text-cobalt hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      disabled={deleting === contact.id}
                      className="text-xs text-red hover:text-red-700 disabled:opacity-50"
                    >
                      {deleting === contact.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onAdd}
            className="w-full px-3 py-2 text-xs rounded-lg border border-line text-ink hover:bg-paper-alt transition-colors"
          >
            + Add Another Contact
          </button>
        </>
      )}

      {/* Log Engagement Modal */}
      {loggingEngagement && (
        <LogEngagementModal
          contactId={loggingEngagement}
          contactName={contacts.find(c => c.id === loggingEngagement)?.name || ''}
          dealId={dealId}
          onClose={() => setLoggingEngagement(null)}
          onSuccess={() => {
            setLoggingEngagement(null);
            onEngagementLogged?.();
          }}
        />
      )}
    </div>
  );
}
