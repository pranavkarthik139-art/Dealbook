'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SE {
  id: number;
  name: string;
  email: string;
  image?: string;
  lastActive: string;
  activeDealCount: number;
}

interface Deal {
  id: number;
  name: string;
  amount: number | null;
  stage: string;
  status: string;
}

interface Assignment {
  dealId: number;
  seUserId: number;
  seUser: {
    id: number;
    name: string;
    email: string;
  };
  assignedAt: string;
}

export default function TeamPage() {
  const [salesEngineers, setSalesEngineers] = useState<SE[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [assignments, setAssignments] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState<'team' | 'deals'>('team');

  useEffect(() => {
    const loadData = async () => {
      try {
        const sesResponse = await fetch('/api/team/sales-engineers');
        if (sesResponse.ok) {
          const ses = await sesResponse.json();
          setSalesEngineers(ses);
        }

        const dealsResponse = await fetch('/api/deals');
        if (dealsResponse.ok) {
          const dealsData = await dealsResponse.json();
          setDeals(dealsData.deals || []);
        }

        const assignmentsResponse = await fetch('/api/deals/assign');
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          const assignmentMap: Record<number, number> = {};
          assignmentsData.forEach((a: Assignment) => {
            assignmentMap[a.dealId] = a.seUserId;
          });
          setAssignments(assignmentMap);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAssignDeal = async (dealId: number, seUserId: number) => {
    try {
      const response = await fetch('/api/deals/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, seUserId }),
      });

      if (response.ok) {
        setAssignments(prev => ({ ...prev, [dealId]: seUserId }));
        alert('Deal assigned successfully');
      }
    } catch (err) {
      console.error('Error assigning deal:', err);
      alert('Failed to assign deal');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontFamily: '"Playfair Display", serif', marginBottom: '30px' }}>
        Team Management
      </h1>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '7px',
          marginBottom: '20px',
          color: '#c33',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid var(--line)' }}>
        <button
          onClick={() => setSelectedTab('team')}
          style={{
            padding: '12px 0',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: selectedTab === 'team' ? 'var(--cobalt)' : 'var(--ink-subtle)',
            borderBottom: selectedTab === 'team' ? '2px solid var(--cobalt)' : 'none',
          }}
        >
          Team Members ({salesEngineers.length})
        </button>
        <button
          onClick={() => setSelectedTab('deals')}
          style={{
            padding: '12px 0',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: selectedTab === 'deals' ? 'var(--cobalt)' : 'var(--ink-subtle)',
            borderBottom: selectedTab === 'deals' ? '2px solid var(--cobalt)' : 'none',
          }}
        >
          Deal Assignments ({deals.length})
        </button>
      </div>

      {selectedTab === 'team' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {salesEngineers.map((se) => (
              <div key={se.id} style={{
                padding: '20px',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cobalt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 600,
                  }}>
                    {se.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0' }}>{se.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--ink-subtle)', margin: 0 }}>{se.email}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--ink-subtle)', margin: '0 0 4px 0' }}>Active Deals</p>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cobalt)', margin: 0 }}>
                      {se.activeDealCount}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--ink-subtle)', margin: '0 0 4px 0' }}>Last Active</p>
                    <p style={{ fontSize: '12px', margin: 0 }}>
                      {new Date(se.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'deals' && (
        <div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Deal</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Stage</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px' }}>
                      <Link href={`/deals/${deal.id}`} style={{ color: 'var(--cobalt)', textDecoration: 'none' }}>
                        {deal.name}
                      </Link>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {deal.amount ? `$${deal.amount.toLocaleString()}` : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>{deal.stage}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: deal.status === 'active' ? '#efe' : '#fee',
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}>
                        {deal.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={assignments[deal.id] || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignDeal(deal.id, parseInt(e.target.value));
                          }
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '5px',
                          border: '1px solid var(--line)',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">Select SE...</option>
                        {salesEngineers.map((se) => (
                          <option key={se.id} value={se.id}>
                            {se.name} ({se.activeDealCount} active)
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
