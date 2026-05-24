'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ThemeSelector } from '@/components/dashboard/ThemeSelector';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface DealAssignment {
  id: number;
  dealId: number;
  seUserId: number;
  deal: { id: number; name: string };
  seUser: { id: number; name: string; email: string };
}

interface Deal {
  id: number;
  name: string;
  amount?: number;
  stage?: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [assignments, setAssignments] = useState<DealAssignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningDealId, setAssigningDealId] = useState<number | null>(null);
  const [selectedSeId, setSelectedSeId] = useState<string>('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const dealsRes = await fetch('/api/deals');
      if (dealsRes.ok) {
        const data = await dealsRes.json();
        setDeals(data.deals || []);
      }

      // Fetch ALL assignments for this settings page
      const assignmentsRes = await fetch('/api/deals/assignments?all=true');
      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json();
        setAssignments(data.assignments || []);
      }

      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignDeal = async (assignmentId: number) => {
    await fetch(`/api/deals/assignments/${assignmentId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAssignDeal = async (dealId: number, seUserId: number) => {
    try {
      const response = await fetch('/api/deals/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, seUserId }),
      });

      if (response.ok) {
        setAssigningDealId(null);
        setSelectedSeId('');
        fetchData();
      } else {
        const errorData = await response.json();
        // Extract error message from different possible formats
        const errorMsg = errorData.message || errorData.details || errorData.error || 'Failed to assign deal';
        console.error('Assignment error:', errorData);
        alert(`Failed to assign deal: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error assigning deal:', error);
      alert(`Error assigning deal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings & Delegation</h1>
            <p className="text-slate-600">Assign deals to your Sales Engineers</p>
          </div>
          <ThemeSelector />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="space-y-4">
            {deals.map(deal => {
              const dealAssignments = assignments.filter(a => a.dealId === deal.id);
              const isAssigning = assigningDealId === deal.id;

              return (
                <div key={deal.id} className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900">{deal.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {deal.amount && `$${(deal.amount / 1000).toFixed(1)}k`} • {deal.stage}
                  </p>

                  <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Assigned SEs:</p>

                  {/* Display assigned SEs */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {dealAssignments.map(a => (
                      <div key={a.id} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {a.seUser.name || a.seUser.email}
                        <button
                          onClick={() => handleUnassignDeal(a.id)}
                          className="ml-1 font-bold hover:text-blue-800 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {dealAssignments.length === 0 && (
                      <p className="text-sm text-slate-500 italic">No SEs assigned yet</p>
                    )}
                  </div>

                  {/* Assign dropdown */}
                  {isAssigning ? (
                    <div className="flex gap-2">
                      <select
                        value={selectedSeId}
                        onChange={(e) => setSelectedSeId(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid var(--line)',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'var(--paper)',
                          color: 'var(--ink)',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Select a Sales Engineer...</option>
                        {users
                          .filter(u => u.role === 'sales_engineer')
                          .map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name || user.email}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => {
                          console.log('[Assign Button] Clicked. selectedSeId:', selectedSeId, 'dealId:', deal.id);
                          if (selectedSeId) {
                            console.log('[Assign Button] Calling handleAssignDeal with dealId:', deal.id, 'seUserId:', parseInt(selectedSeId));
                            handleAssignDeal(deal.id, parseInt(selectedSeId));
                          } else {
                            console.log('[Assign Button] selectedSeId is empty');
                          }
                        }}
                        disabled={!selectedSeId}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => {
                          setAssigningDealId(null);
                          setSelectedSeId('');
                        }}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid var(--line)',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'transparent',
                          color: 'var(--ink)',
                          cursor: 'pointer'
                        }}
                        className="hover:bg-opacity-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssigningDealId(deal.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        backgroundColor: 'var(--line)',
                        color: 'var(--ink)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      className="hover:opacity-80 transition"
                    >
                      + Assign SE
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
