'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  const [loading, setLoading] = useState(true);

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

      const assignmentsRes = await fetch('/api/deals/assignments');
      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json();
        setAssignments(data.assignments || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignDeal = async (assignmentId: number) => {
    await fetch(`/api/deals/assignments/${assignmentId}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings & Delegation</h1>
        <p className="text-slate-600 mb-8">Assign deals to your Sales Engineers</p>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="space-y-4">
            {deals.map(deal => (
              <div key={deal.id} className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-900">{deal.name}</h3>
                <p className="text-sm text-slate-600 mb-3">
                  {deal.amount && `$${(deal.amount / 1000).toFixed(1)}k`} • {deal.stage}
                </p>

                <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Assigned SEs:</p>
                <div className="flex flex-wrap gap-2">
                  {assignments.filter(a => a.dealId === deal.id).map(a => (
                    <div key={a.id} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {a.seUser.name}
                      <button
                        onClick={() => handleUnassignDeal(a.id)}
                        className="ml-1 font-bold hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {assignments.filter(a => a.dealId === deal.id).length === 0 && (
                    <p className="text-sm text-slate-500 italic">No SEs assigned yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-blue-50 rounded text-sm text-blue-700">
            ℹ️ Team member assignment will be enhanced when Salesforce integration is added
          </div>
        </div>
      </div>
    </div>
  );
}
