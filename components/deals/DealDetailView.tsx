'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DealHealthScore } from './DealHealthScore';
import { DealTimeline } from './DealTimeline';
import { CompanyEnrichment } from './CompanyEnrichment';
import { ContactList } from './ContactList';
import { ContactForm } from './ContactForm';
import { DealIntelligence } from './DealIntelligence';
import { IntelligenceAlerts } from './IntelligenceAlerts';
import { GongInsightCard } from './GongInsightCard';
import { CallLogModal } from './CallLogModal';
import { PulseAlert } from './PulseAlert';
import { EmailThread } from './EmailThread';
import { DealDetailHeader } from './DealDetailHeader';
import { DealDetailSkeleton } from '@/components/common/SkeletonLoader';
import { calculateDealPulse, type PulseSignal } from '@/lib/dealPulse';
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

interface Call {
  id: number;
  title: string;
  callDate: string;
  durationMinutes?: number;
  attendees: string[];
  notes?: string;
  gongDescription?: string;
  gongInsightSummary?: string;
  gongRiskLevel?: string;
}

interface Deal {
  id: number;
  name: string;
  email?: string | null;
  amount?: number;
  status?: string;
  stage?: string;
  probability?: number;
  expectedCloseDate?: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string | null;
  todos?: Array<{ id: number; content: string; completed: boolean }>;
  calendarEvents?: Array<{ id: number; title: string; startTime: string; endTime: string; attendees?: string[] }>;
  activityLogs?: Array<{ id: number; action: string; description?: string; createdAt: string }>;
}

interface GongInsight {
  id: number;
  callBrief: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskDescription?: string;
  nextSteps: string;
}

// Generate consistent mock Gong insights for any deal ID
function generateGongInsight(dealId: number, dealName: string): GongInsight {
  const insightVariations: Omit<GongInsight, 'id'>[] = [
    {
      callBrief: `Discovery call with stakeholder team completed. Strong product-market fit signals detected. Budget approved for Q2. Wants to move to POC phase next month.`,
      riskLevel: 'low',
      riskDescription: 'No blockers identified. Deal is progressing normally with clear next steps.',
      nextSteps: '• Send proposal with POC terms\n• Schedule technical kick-off meeting\n• Confirm POC timeline and success criteria',
    },
    {
      callBrief: `Technical evaluation call held. Legal and compliance team raised data residency concerns. Champion is engaged but CTO is still evaluating technical feasibility. Budget confirmed for Q3 commitment.`,
      riskLevel: 'medium',
      riskDescription: 'Legal/compliance review needed before proceeding. Technical evaluation ongoing. No budget constraints.',
      nextSteps: '• Send legal data sheet and compliance documentation\n• Schedule technical architecture review\n• Prepare compliance questionnaire response\n• Follow up with CTO in 5 days',
    },
    {
      callBrief: `Stakeholder alignment meeting. Decision makers present but still evaluating competing solutions. Our unique feature on data isolation was well-received. Waiting on security audit completion.`,
      riskLevel: 'medium',
      riskDescription: 'Customer evaluation phase ongoing. Competing vendors in mix. Security audit is blocker.',
      nextSteps: '• Provide security audit timeline\n• Schedule competitive win-loss analysis\n• Share customer references in their vertical\n• Plan executive sponsor call for next week',
    },
    {
      callBrief: `Final negotiation call with procurement and CFO. Price discussions ongoing. Legal has signed off on all terms. Implementation timeline agreed: 60-day deployment.`,
      riskLevel: 'low',
      riskDescription: 'All technical and legal requirements met. Final pricing negotiation in progress.',
      nextSteps: '• Finalize contract by EOW\n• Schedule deal review with legal\n• Create implementation kickoff agenda\n• Assign account team',
    },
    {
      callBrief: `Call with original champion who recently changed roles. New sponsor is skeptical and wants to re-evaluate requirements. Original team is now split on platform choice.`,
      riskLevel: 'high',
      riskDescription: 'Key contact transition risk. Deal momentum has slowed due to stakeholder change. Re-evaluation likely.',
      nextSteps: '• Emergency meeting with new sponsor to address concerns\n• Gather success stories from similar transitions\n• Identify new power users and secure their support\n• Assess deal probability and timeline reset',
    },
  ];

  // Use dealId to consistently pick the same variation
  const index = dealId % insightVariations.length;
  const insight = insightVariations[index];

  return {
    id: dealId,
    ...insight,
  };
}

export function DealDetailView({ dealId }: { dealId: number }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    status: '',
    email: '',
    probability: 50,
    expectedCloseDate: '',
  });
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string>('');
  const [dealContacts, setDealContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [syncedGong, setSyncedGong] = useState(false);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [syncingGong, setSyncingGong] = useState(false);
  const [pulse, setPulse] = useState<PulseSignal | null>(null);

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

  const fetchCalls = async () => {
    try {
      setLoadingCalls(true);
      const response = await fetch(`/api/calls?dealId=${dealId}`);
      if (response.ok) {
        const data = await response.json();
        setCalls(data);
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoadingCalls(false);
    }
  };

  const handleLogCall = async (callData: any) => {
    try {
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callData),
      });

      if (response.ok) {
        await fetchCalls();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to log call');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error logging call:', msg);
      throw error;
    }
  };

  const handleUpdateGongDescription = async (callId: number, description: string) => {
    try {
      const response = await fetch(`/api/calls/${callId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gongDescription: description }),
      });

      if (response.ok) {
        await fetchCalls();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update Gong description');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating Gong description:', msg);
      throw error;
    }
  };

  const handleSyncGong = async () => {
    try {
      setSyncingGong(true);
      const response = await fetch(`/api/calls/gong/sync?dealId=${dealId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Gong sync result:', data);
        await fetchCalls();
        // Show success message
        if (data.syncedCount > 0) {
          console.log(`✅ Synced ${data.syncedCount} calls from Gong`);
        } else {
          console.log('No new calls to sync');
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync Gong calls');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error syncing Gong:', msg);
    } finally {
      setSyncingGong(false);
    }
  };

  const calculatePulse = () => {
    if (!deal || deal.activityLogs === undefined) return;

    // Transform activity logs for pulse calculation
    const activityLogsForPulse = (deal.activityLogs || []).map(log => ({
      action: log.action,
      createdAt: new Date(log.createdAt)
    }));

    // Transform calendar events
    const calendarEventsForPulse = (deal.calendarEvents || []).map(event => ({
      startTime: new Date(event.startTime)
    }));

    // Transform calls
    const callsForPulse = calls.map(call => ({
      callDate: new Date(call.callDate)
    }));

    // Transform contacts
    const contactsForPulse = dealContacts.map(contact => ({
      id: contact.id,
      lastContactedAt: contact.lastContactedAt ? new Date(contact.lastContactedAt) : undefined
    }));

    // Transform Gong data from calls
    const gongDataForPulse = calls.map(call => ({
      description: call.gongDescription,
      riskLevel: call.gongRiskLevel
    }));

    // Calculate pulse
    const calculatedPulse = calculateDealPulse(
      activityLogsForPulse,
      calendarEventsForPulse,
      callsForPulse,
      gongDataForPulse,
      calls,
      contactsForPulse
    );

    setPulse(calculatedPulse);
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
            probability: data.probability || 50,
            expectedCloseDate: data.expectedCloseDate
              ? new Date(data.expectedCloseDate).toISOString().split('T')[0]
              : '',
          });

          // Auto-enrich company data
          await enrichCompany(data.name);

          // Fetch deal contacts
          await fetchDealContacts();

          // Fetch calls for this deal
          await fetchCalls();
        }
      } catch (error) {
        console.error('Error fetching deal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealId]);

  // Calculate pulse whenever deal or calls change
  useEffect(() => {
    calculatePulse();
  }, [deal, calls, dealContacts]);

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
          probability: formData.probability || undefined,
          expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined,
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
    return <DealDetailSkeleton />;
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-2xl font-bold text-ink mb-2">Deal Not Found</h2>
        <p className="text-ink-lighter mb-6">This deal no longer exists or you don't have access to it.</p>
        <a
          href="/deals"
          className="px-4 py-2 rounded-lg bg-cobalt text-white text-sm hover:opacity-90 transition-opacity"
        >
          ← Back to Deals
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-12">
        {/* Enhanced Deal Header */}
        <DealDetailHeader
          deal={deal}
          isEditing={editing}
          editValues={formData}
          onEdit={() => setEditing(true)}
          onEditChange={(field, value) => setFormData({ ...formData, [field]: value })}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />

        {/* Divider */}
        <div className="border-b border-line" />

        {/* Email Display Section */}
        <div>
          <p className="text-xs font-medium text-ink-lighter uppercase tracking-wide mb-3">Primary Contact Email</p>

          {editingEmail ? (
            <div className="space-y-3 max-w-md">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full px-0 py-2 border-b border-cobalt focus:outline-none focus:border-cobalt text-sm"
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
                  className="px-3 py-1 text-xs rounded bg-cobalt text-white hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setFormData({ ...formData, email: deal?.email || '' });
                    setEditingEmail(false);
                  }}
                  className="px-3 py-1 text-xs rounded border border-line text-ink hover:bg-paper-alt transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                {deal.email ? (
                  <a href={`mailto:${deal.email}`} className="text-base font-mono text-cobalt hover:opacity-80">
                    {deal.email}
                  </a>
                ) : (
                  <p className="text-base text-ink-lighter">No contact email set</p>
                )}
              </div>
              <button
                onClick={() => setEditingEmail(true)}
                className="text-xs text-cobalt hover:opacity-80 font-medium"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-b border-line mt-8 mb-8" />

        {/* Gong Insight Section - Below Deal Header & Email */}
        {!syncedGong && (
          <div>
            <GongInsightCard
              insight={generateGongInsight(dealId, deal.name)}
              dealId={dealId}
              onSync={() => setSyncedGong(true)}
            />
          </div>
        )}

        {/* Divider */}
        <div className="border-b border-line mt-8 mb-8" />

        {/* Company Enrichment */}
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#999', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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

        {/* Divider */}
        <div className="border-b border-line mt-8 mb-8" />

        {/* Contacts Management */}
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#999', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Stakeholders
          </h2>
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
              onEngagementLogged={() => {
                // Refresh deal data when engagement is logged
                fetchDealContacts();
              }}
              isLoading={loadingContacts}
            />
          )}
        </div>


        {/* Timeline */}
        <div className="space-y-4">
          {/* Log Call Button */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowCallLogModal(true)}
              className="px-4 py-2 rounded-lg bg-cobalt text-white text-sm hover:opacity-90 transition-opacity"
            >
              📞 Log Call
            </button>
            <button
              onClick={handleSyncGong}
              disabled={syncingGong}
              className="px-4 py-2 rounded-lg border border-cobalt text-cobalt text-sm hover:bg-cobalt hover:bg-opacity-5 transition-colors disabled:opacity-50"
            >
              {syncingGong ? 'Syncing...' : 'Sync Gong'}
            </button>
          </div>

          {/* Call Log Modal */}
          <CallLogModal
            dealId={dealId}
            isOpen={showCallLogModal}
            onClose={() => setShowCallLogModal(false)}
            onSubmit={handleLogCall}
          />

          {/* Timeline */}
          <DealTimeline
            activities={deal.activityLogs || []}
            calls={calls}
            onUpdateGongDescription={handleUpdateGongDescription}
          />
        </div>

        {/* Email Thread Section */}
        <div className="border-t border-line pt-12">
          <h2 className="text-lg font-semibold text-ink mb-6">Email Interactions</h2>
          <EmailThread dealId={deal.id} prospectEmail={deal.email || undefined} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-12">
        {/* Intelligence Alerts */}
        <div className="sticky top-8">
          <div className="bg-white rounded-lg border border-line p-6 space-y-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-lg">⚡</span>
              Intelligence Alerts
            </h3>

            {/* Pulse Alert - Part of Intelligence Detection */}
            {pulse && <PulseAlert pulse={pulse} />}

            {/* Other Intelligence Data */}
            <IntelligenceAlerts dealId={deal.id} />
          </div>
        </div>

        {/* Deal Intelligence */}
        <DealIntelligence deal={deal} health={deal.probability || 50} />

        {/* Health Score */}
        <DealHealthScore deal={deal} />

        {/* To-Dos */}
        {deal.todos && deal.todos.length > 0 && (
          <div className="bg-white rounded-lg border border-line p-6">
            <h3 className="font-medium text-ink mb-4">To-Dos</h3>
            <div className="space-y-2">
              {deal.todos.map((todo) => (
                <label key={todo.id} className="flex items-center gap-3 cursor-pointer hover:bg-paper-alt p-2 rounded">
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
