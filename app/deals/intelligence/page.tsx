'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import DealIntelligenceDashboard from '@/components/deals/DealIntelligenceDashboard';
import { Spinner } from '@/components/common/Spinner';

/**
 * Intelligence Dashboard Page
 *
 * Portfolio-level view of deal health and risk across all deals
 * Features:
 * - Risk level filters (low/medium/high/critical)
 * - Health score range filter
 * - Momentum filter (positive/neutral/negative)
 * - Deal stage filter
 * - Deal value range filter
 * - Days in stage filter
 * - Kanban-style card display with key insights
 * - Sortable table view alternative
 * - Batch actions (send emails, schedule calls, add tasks)
 * - Key metrics: critical risk count, silent stakeholders, portfolio health trend
 */
export default function IntelligenceDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading complete
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Deal Intelligence
          </h1>
          <p className="text-slate-600">
            Portfolio-level view of deal health, risk, and momentum across all deals
          </p>
        </div>

        {/* Dashboard */}
        <Suspense fallback={<Spinner />}>
          <DealIntelligenceDashboard />
        </Suspense>
      </div>
    </div>
  );
}
