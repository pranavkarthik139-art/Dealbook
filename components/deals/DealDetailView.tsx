'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { useTheme } from '@/lib/ThemeContext';
import { DealDetailSkeleton } from '@/components/common/SkeletonLoader';

interface Deal {
  id: number;
  name: string;
  email?: string | null;
  amount?: number;
  stage?: string | null;
  createdAt: string;
  lastActivityAt?: string | null;
}

export function DealDetailView({ dealId }: { dealId: number }) {
  const theme = useTheme();
  const isTypeUI = theme === 'typeui';

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await fetch(`/api/deals/${dealId}`);
        if (response.ok) {
          const data = await response.json();
          setDeal(data);
        }
      } catch (error) {
        console.error('Error fetching deal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealId]);

  if (loading) {
    return <DealDetailSkeleton />;
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h2 className={`text-2xl font-bold mb-2 ${isTypeUI ? 'text-[#FAFAFA]' : 'text-ink'}`}>Deal Not Found</h2>
        <p className={`mb-6 ${isTypeUI ? 'text-[#A1A1A6]' : 'text-ink-lighter'}`}>This deal no longer exists or you don't have access to it.</p>
        <a href="/deals" className={`px-4 py-2 rounded-xl ${isTypeUI ? 'bg-[#0C5CAB] hover:bg-[#0A4A8A]' : 'bg-cobalt hover:opacity-90'} text-white text-sm transition-colors`}>
          ← Back to Deals
        </a>
      </div>
    );
  }

  // Calculate deal metrics
  const dealAge = differenceInDays(new Date(), new Date(deal.createdAt));
  const lastActivityText = deal.lastActivityAt
    ? formatDistanceToNow(new Date(deal.lastActivityAt), { addSuffix: true })
    : '—';

  // Theme styling
  const glassPanel = `rounded-2xl border ${isTypeUI ? 'bg-[#121216] border-[#262629] shadow-[0 8px 32px rgba(0,0,0,0.4)] backdrop-blur-sm' : 'bg-white border-line shadow-md'}`;
  const textPrimary = isTypeUI ? 'text-[#FAFAFA]' : 'text-ink';
  const textSecondary = isTypeUI ? 'text-[#A1A1A6]' : 'text-ink-lighter';
  const accentColor = isTypeUI ? '#0C5CAB' : '#6366F1';

  return (
    <div className={`${isTypeUI ? 'bg-[#09090B]' : ''} min-h-screen p-8`}>
      {/* Clean Card with 5 Critical Fields */}
      <div className={`${glassPanel} p-8 max-w-2xl`}>
        {/* Deal Name & Revenue */}
        <div className="mb-12">
          <h1 className={`font-serif text-4xl font-bold ${textPrimary} mb-4`}>{deal.name}</h1>
          {deal.amount && (
            <p className="text-4xl font-bold" style={{ color: accentColor }}>
              ${(deal.amount / 1000).toLocaleString()}k
            </p>
          )}
        </div>

        {/* Stage Badge */}
        {deal.stage && (
          <div className="mb-8">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isTypeUI ? 'bg-[#0C5CAB] bg-opacity-20 text-[#0C5CAB]' : 'bg-blue-100 text-blue-900'}`}>
              {deal.stage.toUpperCase()}
            </span>
          </div>
        )}

        {/* Key Information Fields - 24px spacing */}
        <div className="space-y-8">
          {/* Field 1: Company Name */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${textSecondary}`}>Company Name</p>
            <p className={`text-lg font-medium ${textPrimary}`}>—</p>
            <p className={`text-xs mt-1 ${textSecondary}`}>Add company information to your contacts</p>
          </div>

          {/* Field 2: Primary Contact Email */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${textSecondary}`}>Primary Contact Email</p>
            <p className={`text-lg font-mono ${textPrimary}`} style={{ color: accentColor }}>
              {deal.email || '—'}
            </p>
          </div>

          {/* Field 3: Last Activity */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${textSecondary}`}>Last Activity</p>
            <p className={`text-lg font-medium ${textPrimary}`}>{lastActivityText}</p>
          </div>

          {/* Field 4: Deal Age */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${textSecondary}`}>Deal Age</p>
            <p className={`text-lg font-medium ${textPrimary}`}>{dealAge} day{dealAge !== 1 ? 's' : ''}</p>
          </div>

          {/* Field 5: Revenue */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${textSecondary}`}>Revenue</p>
            <p className={`text-lg font-medium ${textPrimary}`}>
              {deal.amount ? `$${(deal.amount / 1000).toLocaleString()}k` : '—'}
            </p>
          </div>
        </div>

        {/* View More Details Button */}
        <div className={`border-t ${isTypeUI ? 'border-[#262629]' : 'border-line'} mt-12 pt-8`}>
          <button
            style={{ backgroundColor: accentColor }}
            className="px-6 py-2 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
          >
            View More Details
          </button>
        </div>
      </div>
    </div>
  );
}
