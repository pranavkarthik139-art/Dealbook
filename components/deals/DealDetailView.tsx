'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DealHealthScore } from './DealHealthScore';
import { DealTimeline } from './DealTimeline';
import { CompanyEnrichment } from './CompanyEnrichment';
import { ContactList } from './ContactList';
import { ContactForm } from './ContactForm';
import { DealIntelligence } from './DealIntelligence';
import type { CompanyData, ContactData } from '@/lib/apollo';

interface Contact {
  id: number;
  name: string;
  email: string;
  title?: string;
  role?: string;
  company?: string;
  linkedinUrl?: string;
  notes?: string;
  lastContactedAt?: string;
}

interface Deal {
  id: number;
  name: string;
  email?: string | null;
  amount?: number;
  status?: string;
  stage?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string | null;
  todos?: Array<{ id: number; content: string; completed: boolean }>;
  calendarEvents?: Array<{ id: number; title: string; startTime: string; endTime: string; attendees?: string[] }>;
  activityLogs?: Array<{ id: number; action: string; description?: string; createdAt: string }>;
}

export function DealDetailView({ dealId }: { dealId: number }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '', status: '', email: '' });
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string>('');
  const [dealContacts, setDealContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const fetchDealContacts = async () => {
    try {
      setLoadingContacts(true);
      const response = await fetch(`/api/deals/${dealId}/contacts`);
      if (response.ok) {
        const data = await response.json();
        setDealContacts(data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleSaveContact = async (contactData: Omit<Contact, 'id'>) => {
    try {
      const url = editingContact
        ? `/api/contacts/${editingContact.id}`
        : `/api/deals/${dealId}/contacts`;

      const method = editingContact ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        await fetchDealContacts();
        setShowContactForm(false);
        setEditingContact(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save contact');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(msg);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDealContacts();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete contact');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(msg);
    }
  };

  const enrichCompany = async (dealName?: string) => {
    if (!deal && !dealName) return;

    setEnriching(true);
    setEnrichError('');

    try {
      // Extract company name (before the " - " separator)
      const fullName = dealName || deal?.name;
      const companyName = fullName?.split(' - ')[0].trim() || fullName;
      console.log('🔍 Enriching company with query:', companyName);

      const response = await fetch('/api/enrichment/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: companyName,
        }),
      });

      console.log('📡 Enrichment response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Enrichment data:', data);
        setCompanyData(data.company);
        setContacts(data.contacts || []);
        if (!data.company) {
          setEnrichError('No company found. Try a different search term.');
        }
      } else {
        const error = await response.text();
        console.error('❌ Enrichment error:', error);
        setEnrichError(`Error: ${response.status} - ${error}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('❌ Error enriching company:', msg);
      setEnrichError(`Failed to enrich: ${msg}`);
    } finally {
      setEnriching(false);
    }
  };

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await fetch(`/api/deals/${dealId}`);
        if (response.ok) {
          const data = await response.json();
          setDeal(data);
          setFormData({
            name: data.name,
            amount: data.amount || '',
            status: data.status || 'active',
            email: data.email || '',
          });

          // Auto-enrich company data
          await enrichCompany(data.name);

          // Fetch deal contacts
          await fetchDealContacts();
        }
      } catch (error) {
        console.error('Error fetching deal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealId]);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          amount: formData.amount ? parseFloat(formData.amount) : undefined,
          status: formData.status,
          email: formData.email || null,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setDeal(updated);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-cobalt border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!deal) {
    return <div className="text-center text-ink-lighter py-8">Deal not found</div>;
  }

  const getStageColor = (stage?: string) => {
    switch (stage) {
      case 'demo':
        return 'bg-blue-100 text-blue-900';
      case 'poc':
        return 'bg-purple-100 text-purple-900';
      case 'validation':
        return 'bg-indigo-100 text-indigo-900';
      case 'closed':
        return 'bg-green-light text-green';
      default:
        return 'bg-slate-100 text-ink';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-light text-green';
      case 'on_hold':
        return 'bg-amber-light text-amber';
      case 'lost':
        return 'bg-red-light text-red';
      case 'closed':
        return 'bg-slate-100 text-ink';
      default:
        return 'bg-slate-100 text-ink';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Column */}
      <div className="lg:col-span-2">
        {/* Header Section */}
        <div className="bg-white rounded-lg border border-line p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="font-serif text-3xl font-bold text-ink w-full border-b border-cobalt focus:outline-none"
                />
              ) : (
                <h1 className="font-serif text-3xl font-bold text-ink">{deal.name}</h1>
              )}
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-lg border border-line text-ink text-sm hover:bg-slate-50 transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {/* Amount */}
          <div className="mb-6">
            {editing ? (
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Amount"
                className="text-2xl font-bold text-cobalt border-b border-cobalt focus:outline-none"
              />
            ) : (
              <p className="text-2xl font-bold text-cobalt">
                {deal.amount ? `$${(deal.amount / 1000).toFixed(1)}k` : '—'}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex gap-3 flex-wrap">
            {deal.stage && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(deal.stage)}`}>
                {deal.stage.toUpperCase()}
              </span>
            )}

            {editing ? (
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(formData.status)}`}
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="lost">Lost</option>
                <option value="closed">Closed</option>
              </select>
            ) : (
              deal.status && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                  {deal.status.replace('_', ' ').toUpperCase()}
                </span>
              )
            )}

            {deal.lastActivityAt && (
              <span className="px-3 py-1 rounded-full text-xs text-ink-lighter bg-slate-100">
                {formatDistanceToNow(new Date(deal.lastActivityAt), { addSuffix: true })}
              </span>
            )}
          </div>

          {editing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-line">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg border border-line text-ink text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-cobalt text-white text-sm hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Company Enrichment */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' }}>
            Company Details
          </h2>
          <CompanyEnrichment
            dealName={deal.name}
            companyData={companyData}
            contacts={contacts}
            loading={enriching}
            error={enrichError}
            onEnrich={() => enrichCompany()}
          />
        </div>

        {/* Contacts Management */}
        <div className="bg-white rounded-lg border border-line p-6 mb-8">
          <h2 className="text-lg font-semibold text-ink mb-4">Stakeholders</h2>
          {showContactForm ? (
            <div className="space-y-4">
              <ContactForm
                dealId={dealId}
                contact={editingContact}
                onSave={handleSaveContact}
                onCancel={() => {
                  setShowContactForm(false);
                  setEditingContact(null);
                }}
                isLoading={loadingContacts}
              />
            </div>
          ) : (
            <ContactList
              dealId={dealId}
              contacts={dealContacts}
              primaryContactEmail={deal.email || undefined}
              onAdd={() => setShowContactForm(true)}
              onEdit={(contact) => {
                setEditingContact(contact);
                setShowContactForm(true);
              }}
              onDelete={handleDeleteContact}
              isLoading={loadingContacts}
            />
          )}
        </div>

        {/* Primary Contact Email */}
        <div className="bg-white rounded-lg border border-line p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-ink">Primary Contact Email</h3>
            {!editingEmail && (
              <button
                onClick={() => setEditingEmail(true)}
                className="text-xs text-cobalt hover:text-blue-700"
              >
                Edit
              </button>
            )}
          </div>
          {editingEmail ? (
            <div className="space-y-3">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/deals/${dealId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: formData.email || null,
                        }),
                      });
                      if (response.ok) {
                        const updated = await response.json();
                        setDeal(updated);
                        setEditingEmail(false);
                      }
                    } catch (error) {
                      console.error('Error updating email:', error);
                    }
                  }}
                  className="px-3 py-1 text-xs rounded-lg bg-cobalt text-white hover:opacity-90"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setFormData({ ...formData, email: deal?.email || '' });
                    setEditingEmail(false);
                  }}
                  className="px-3 py-1 text-xs rounded-lg border border-line text-ink hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-ink-lighter mt-2">
                Calendar events with this email in attendees will auto-log as activities.
              </p>
            </div>
          ) : (
            <div className="text-sm">
              {deal.email ? (
                <p className="font-mono text-cobalt">{deal.email}</p>
              ) : (
                <p className="text-ink-lighter italic">No contact email set</p>
              )}
              <p className="text-xs text-ink-lighter mt-2">
                Calendar events with this email in attendees will auto-log as activities.
              </p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <DealTimeline activities={deal.activityLogs || []} />
      </div>

      {/* Right Sidebar */}
      <div className="space-y-8">
        {/* Deal Intelligence */}
        <DealIntelligence deal={deal} health={deal.amount ? 75 : 50} />

        {/* Health Score */}
        <DealHealthScore deal={deal} />

        {/* To-Dos */}
        {deal.todos && deal.todos.length > 0 && (
          <div className="bg-white rounded-lg border border-line p-6">
            <h3 className="font-medium text-ink mb-4">To-Dos</h3>
            <div className="space-y-2">
              {deal.todos.map((todo) => (
                <label key={todo.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    className="w-4 h-4"
                    readOnly
                  />
                  <span className={`text-sm ${todo.completed ? 'line-through text-ink-lighter' : 'text-ink'}`}>
                    {todo.content}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Events */}
        {deal.calendarEvents && deal.calendarEvents.length > 0 && (
          <div className="bg-white rounded-lg border border-line p-6">
            <h3 className="font-medium text-ink mb-4">Upcoming Calls</h3>
            <div className="space-y-3">
              {deal.calendarEvents.map((event) => (
                <div key={event.id} className="text-sm">
                  <p className="font-medium text-ink">{event.title}</p>
                  <p className="text-xs text-ink-lighter">
                    {new Date(event.startTime).toLocaleDateString()} at{' '}
                    {new Date(event.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {event.attendees && event.attendees.length > 0 && (
                    <p className="text-xs text-ink-lighter mt-1">
                      {event.attendees.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
