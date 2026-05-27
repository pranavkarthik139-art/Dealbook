'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { getTheme } from '@/lib/themes';
import { useTheme } from '@/lib/ThemeContext';
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

function generateGongInsight(dealId: number, dealName: string) {
  const insightVariations = [
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

  const index = dealId % insightVariations.length;
  return insightVariations[index];
}

export function DealDetailView({ dealId }: { dealId: number }) {
  const theme = useTheme();
  const themeConfig = getTheme(theme);
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
      }
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDealContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
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
      }
    } catch (error) {
      console.error('Error logging call:', error);
    }
  };

  const handleSyncGong = async () => {
    try {
      setSyncingGong(true);
      const response = await fetch(`/api/calls/gong/sync?dealId=${dealId}`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchCalls();
      }
    } catch (error) {
      console.error('Error syncing Gong:', error);
    } finally {
      setSyncingGong(false);
    }
  };

  const enrichCompany = async (dealName?: string) => {
    if (!deal && !dealName) return;

    setEnriching(true);

    try {
      const fullName = dealName || deal?.name;
      const companyName = fullName?.split(' - ')[0].trim() || fullName;

      const response = await fetch('/api/enrichment/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: companyName }),
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyData(data.company);
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error enriching company:', error);
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

          await enrichCompany(data.name);
          await fetchDealContacts();
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
        <a href="/deals" className="px-4 py-2 rounded-lg bg-cobalt text-white text-sm hover:opacity-90">
          ← Back to Deals
        </a>
      </div>
    );
  }

  const daysInStage = deal.lastActivityAt ? differenceInDays(new Date(), new Date(deal.lastActivityAt)) : 0;
  const dealAge = differenceInDays(new Date(), new Date(deal.createdAt));
  const gongInsight = generateGongInsight(dealId, deal.name);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-line p-8">
        {/* Top Row: Name, Amount, Badges, Edit Button */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            {editing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="font-serif text-4xl font-bold text-ink w-full border-b border-cobalt focus:outline-none"
              />
            ) : (
              <h1 className="font-serif text-4xl font-bold text-ink">{deal.name}</h1>
            )}

            {editing ? (
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Amount"
                className="text-3xl font-bold text-cobalt mt-2 border-b border-cobalt focus:outline-none"
              />
            ) : (
              <p className="text-3xl font-bold text-cobalt mt-2">
                ${(deal.amount || 0) / 1000}k
              </p>
            )}
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-lg border border-line text-cobalt font-medium hover:bg-slate-50 transition-colors"
            >
              ✏️ Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-cobalt text-white font-medium hover:opacity-90"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg border border-line text-ink hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {deal.stage && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900">
              {deal.stage.toUpperCase()}
            </span>
          )}
          {deal.status && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-900">
              {deal.status.replace('_', ' ').toUpperCase()}
            </span>
          )}
          {deal.probability && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
              {deal.probability}% Win
            </span>
          )}
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-4 gap-6 p-6 bg-slate-50 rounded-lg border border-line mb-8">
          <div>
            <p className="text-xs font-semibold text-ink-lighter uppercase">Days in Stage</p>
            <p className="text-2xl font-bold text-ink mt-1">{daysInStage}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-lighter uppercase">Last Activity</p>
            <p className="text-lg font-bold text-ink mt-1">
              {deal.lastActivityAt ? formatDistanceToNow(new Date(deal.lastActivityAt), { addSuffix: true }) : 'None'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-lighter uppercase">Deal Age</p>
            <p className="text-2xl font-bold text-ink mt-1">{dealAge}d</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-lighter uppercase">Close Date</p>
            <p className="text-lg font-bold text-ink mt-1">
              {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        {/* Primary Contact Email */}
        <div className="border-t border-line pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink-lighter uppercase mb-2">Primary Contact Email</p>
              {editingEmail ? (
                <div className="space-y-3 max-w-md">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-0 py-2 border-b border-cobalt focus:outline-none text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/deals/${dealId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: formData.email || null }),
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
                      className="px-3 py-1 text-xs rounded bg-cobalt text-white hover:opacity-90"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingEmail(false)}
                      className="px-3 py-1 text-xs rounded border border-line text-ink hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-lg font-mono text-cobalt">
                  {deal.email || 'No contact email set'}
                </p>
              )}
            </div>
            {!editingEmail && (
              <button
                onClick={() => setEditingEmail(true)}
                className="text-sm text-cobalt font-medium hover:opacity-80"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gong Insight */}
          {!syncedGong && (
            <div className="bg-white rounded-lg border border-line p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">📞</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-ink">Gong Call Insight</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-900 font-semibold inline-block mt-2">
                    {gongInsight.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-ink leading-relaxed mb-4">{gongInsight.callBrief}</p>
              <div className="bg-slate-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400">
                <p className="text-xs font-semibold text-amber-900 mb-2">Key Insight</p>
                <p className="text-sm text-amber-900">{gongInsight.riskDescription}</p>
              </div>
              <div className="border-t border-line pt-4">
                <p className="text-xs font-semibold text-ink-lighter uppercase mb-2">RECOMMENDED NEXT STEPS</p>
                <ul className="space-y-2 text-sm text-ink">
                  {gongInsight.nextSteps.split('\n').map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Company Enrichment */}
          {companyData && (
            <div className="bg-white rounded-lg border border-line p-6">
              <h3 className="text-lg font-semibold text-ink mb-4">Company Details</h3>
              <CompanyEnrichment
                dealName={deal.name}
                companyData={companyData}
                contacts={contacts}
                loading={enriching}
                error=""
                onEnrich={() => enrichCompany()}
              />
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setShowCallLogModal(true)}
                className="px-4 py-2 rounded-lg bg-cobalt text-white text-sm hover:opacity-90"
              >
                📞 Log Call
              </button>
              <button
                onClick={handleSyncGong}
                disabled={syncingGong}
                className="px-4 py-2 rounded-lg border border-cobalt text-cobalt text-sm hover:bg-cobalt hover:bg-opacity-5 disabled:opacity-50"
              >
                {syncingGong ? 'Syncing...' : 'Sync Gong'}
              </button>
            </div>

            <CallLogModal
              dealId={dealId}
              isOpen={showCallLogModal}
              onClose={() => setShowCallLogModal(false)}
              onSubmit={handleLogCall}
            />

            <DealTimeline activities={deal.activityLogs || []} calls={calls} onUpdateGongDescription={() => {}} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Intelligence Alerts */}
          <div className="bg-white rounded-lg border border-line p-6">
            <h3 className="font-semibold text-ink flex items-center gap-2 mb-4">
              <span>⚡</span> Intelligence Alerts
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-xs font-semibold text-green-900 uppercase">Customer Pulse</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-3xl">📈</span>
                  <div>
                    <p className="text-sm font-bold text-green-900">Flatline</p>
                    <p className="text-xs text-green-700">65 bpm</p>
                  </div>
                </div>
                <p className="text-xs text-green-700 mt-2">No recent activity</p>
              </div>
              <IntelligenceAlerts dealId={deal.id} />
            </div>
          </div>

          {/* Deal Health */}
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-amber-900">Deal Health</h3>
              <p className="text-3xl font-bold text-amber-600">45</p>
            </div>
            <p className="text-sm font-medium text-amber-700 mb-3">Medium Risk</p>
            <div className="space-y-2 text-sm text-amber-700 mb-4">
              <p className="font-semibold text-xs uppercase">Risk Factors:</p>
              <ul className="space-y-1 text-xs">
                <li>• No stakeholders identified</li>
                <li>• Moderate deal health (50/100)</li>
              </ul>
            </div>
            <p className="text-sm text-amber-700">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-900 rounded text-xs font-semibold">Neutral Momentum</span>
            </p>
          </div>

          {/* Recommended Next Steps */}
          <div className="bg-white rounded-lg border border-line p-6">
            <h3 className="font-semibold text-ink mb-4">Recommended Next Steps</h3>
            <div className="space-y-3">
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm font-medium text-red-900">Add key stakeholders</p>
                <p className="text-xs text-red-700 mt-1">No contacts on this deal yet. Add decision makers, technical buyers, and champions.</p>
                <p className="text-xs text-red-600 mt-2 font-semibold">Add at least 3 stakeholders before advancing</p>
              </div>
            </div>
          </div>

          {/* Suggested Follow-up */}
          <div className="bg-white rounded-lg border border-line p-6 text-center">
            <p className="text-sm text-ink">Suggested follow-up: <span className="font-semibold">in 1 day</span></p>
          </div>

          {/* To-Dos */}
          {deal.todos && deal.todos.length > 0 && (
            <div className="bg-white rounded-lg border border-line p-6">
              <h3 className="font-medium text-ink mb-4">To-Dos</h3>
              <div className="space-y-2">
                {deal.todos.map((todo) => (
                  <label key={todo.id} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={todo.completed} className="w-4 h-4" readOnly />
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
