'use client';

import { useEffect, useState } from 'react';
import { useCallback } from 'react';
import IntelligenceFilters from './IntelligenceFilters';
import DealIntelligenceCard from './DealIntelligenceCard';
import { BatchEmailModal } from './BatchEmailModal';
import { Spinner } from '../common/Spinner';

interface Deal {
  id: number;
  name: string;
  amount: number | null;
  stage: string | null;
  status: string | null;
  createdAt: string;
  lastActivityAt: string | null;
}

interface DealWithIntelligence extends Deal {
  intelligence?: {
    healthScore: number;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    momentum: 'positive' | 'neutral' | 'negative';
    signals: {
      contactEngagement: Array<{
        contactName: string;
        engagementLevel: 'engaged' | 'moderate' | 'silent';
        riskFactors: string[];
      }>;
    };
    reasoning: {
      keyInsights: string[];
    };
  };
}

interface Filters {
  riskLevel: ('low' | 'medium' | 'high' | 'critical')[];
  healthScoreMin: number;
  healthScoreMax: number;
  momentum: ('positive' | 'neutral' | 'negative')[];
  stage: string[];
  valueMin: number;
  valueMax: number;
  daysInStageMin: number;
  daysInStageMax: number;
}

/**
 * DealIntelligenceDashboard Component
 * Fetches all deals, calculates intelligence for each, applies filters, and displays results
 */
export default function DealIntelligenceDashboard() {
  const [deals, setDeals] = useState<DealWithIntelligence[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<DealWithIntelligence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeals, setSelectedDeals] = useState<Set<number>>(new Set());
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [showBatchEmailModal, setShowBatchEmailModal] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    riskLevel: [],
    healthScoreMin: 0,
    healthScoreMax: 100,
    momentum: [],
    stage: [],
    valueMin: 0,
    valueMax: 10000000,
    daysInStageMin: 0,
    daysInStageMax: 365,
  });

  // Fetch all deals and their intelligence
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/deals');
        if (!response.ok) throw new Error('Failed to fetch deals');

        const data = await response.json();
        const dealsArray = Array.isArray(data) ? data : data.deals || [];

        // Fetch intelligence for each deal in parallel
        const dealsWithIntelligence = await Promise.all(
          dealsArray.map(async (deal: Deal) => {
            try {
              const intelligenceResponse = await fetch(
                `/api/deals/${deal.id}/intelligence`
              );
              if (intelligenceResponse.ok) {
                const intelligenceData = await intelligenceResponse.json();
                return {
                  ...deal,
                  intelligence: intelligenceData.intelligence,
                };
              }
              return deal;
            } catch (e) {
              console.error(`Failed to fetch intelligence for deal ${deal.id}`, e);
              return deal;
            }
          })
        );

        setDeals(dealsWithIntelligence);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch deals');
        console.error('Error fetching deals:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = deals;

    // Filter by risk level
    if (filters.riskLevel.length > 0) {
      filtered = filtered.filter(
        (deal) =>
          deal.intelligence && filters.riskLevel.includes(deal.intelligence.riskLevel)
      );
    }

    // Filter by health score
    filtered = filtered.filter((deal) => {
      const health = deal.intelligence?.healthScore ?? 50;
      return health >= filters.healthScoreMin && health <= filters.healthScoreMax;
    });

    // Filter by momentum
    if (filters.momentum.length > 0) {
      filtered = filtered.filter(
        (deal) =>
          deal.intelligence && filters.momentum.includes(deal.intelligence.momentum)
      );
    }

    // Filter by stage
    if (filters.stage.length > 0) {
      filtered = filtered.filter((deal) =>
        filters.stage.includes(deal.stage || 'unknown')
      );
    }

    // Filter by value
    filtered = filtered.filter((deal) => {
      const value = deal.amount ?? 0;
      return value >= filters.valueMin && value <= filters.valueMax;
    });

    // Filter by days in stage
    filtered = filtered.filter((deal) => {
      const createdDate = new Date(deal.createdAt);
      const now = new Date();
      const daysInStage = Math.floor(
        (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysInStage >= filters.daysInStageMin && daysInStage <= filters.daysInStageMax;
    });

    setFilteredDeals(filtered);
  }, [deals, filters]);

  const toggleSelectDeal = (dealId: number) => {
    const newSelected = new Set(selectedDeals);
    if (newSelected.has(dealId)) {
      newSelected.delete(dealId);
    } else {
      newSelected.add(dealId);
    }
    setSelectedDeals(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedDeals.size === filteredDeals.length) {
      setSelectedDeals(new Set());
    } else {
      setSelectedDeals(new Set(filteredDeals.map((d) => d.id)));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Error: {error}
      </div>
    );
  }

  // Calculate metrics
  const criticalCount = filteredDeals.filter(
    (d) => d.intelligence?.riskLevel === 'critical'
  ).length;
  const silentContactsCount = filteredDeals.reduce((count, deal) => {
    const silent = deal.intelligence?.signals.contactEngagement.filter(
      (c) => c.engagementLevel === 'silent'
    ) || [];
    return count + silent.length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600">Total Deals</div>
          <div className="text-3xl font-bold text-slate-900">{filteredDeals.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            {filteredDeals.length} of {deals.length}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600">Critical Risk</div>
          <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
          <div className="text-xs text-slate-500 mt-1">Needs immediate attention</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600">Silent Stakeholders</div>
          <div className="text-3xl font-bold text-amber-600">{silentContactsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Contacts to re-engage</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600">Avg Health Score</div>
          <div className="text-3xl font-bold text-emerald-600">
            {Math.round(
              filteredDeals.reduce((sum, d) => sum + (d.intelligence?.healthScore ?? 50), 0) /
                Math.max(1, filteredDeals.length)
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">Out of 100</div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <IntelligenceFilters filters={filters} onFiltersChange={setFilters} />

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls */}
          <div className="flex justify-between items-center bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedDeals.size === filteredDeals.length && filteredDeals.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-600">
                {selectedDeals.size > 0
                  ? `${selectedDeals.size} selected`
                  : 'Select deals for actions'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setView('cards')}
                className={`px-3 py-2 rounded text-sm ${
                  view === 'cards'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-3 py-2 rounded text-sm ${
                  view === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Table
              </button>
            </div>
          </div>

          {/* Batch Actions */}
          {selectedDeals.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setShowBatchEmailModal(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                📧 Send Email
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                📞 Schedule Call
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                ✓ Add Task
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                🏷️ Change Status
              </button>
            </div>
          )}

          {/* Deals Display */}
          {view === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal) => (
                  <div key={deal.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedDeals.has(deal.id)}
                      onChange={() => toggleSelectDeal(deal.id)}
                      className="w-4 h-4 rounded border-slate-300 mt-1"
                    />
                    <div className="flex-1">
                      <DealIntelligenceCard
                        deal={deal}
                        intelligence={deal.intelligence as any}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-slate-600">
                  No deals match the selected filters
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Deal Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Stage
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Health
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Risk
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Momentum
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.length > 0 ? (
                    filteredDeals.map((deal) => (
                      <tr key={deal.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                          {deal.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {deal.amount ? `$${(deal.amount / 1000).toFixed(0)}K` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{deal.stage || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-semibold text-slate-900">
                            {deal.intelligence?.healthScore || 50}
                          </span>
                          /100
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                              deal.intelligence?.riskLevel === 'critical'
                                ? 'bg-red-600'
                                : deal.intelligence?.riskLevel === 'high'
                                  ? 'bg-orange-600'
                                  : deal.intelligence?.riskLevel === 'medium'
                                    ? 'bg-amber-600'
                                    : 'bg-green-600'
                            }`}
                          >
                            {deal.intelligence?.riskLevel || 'low'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              deal.intelligence?.momentum === 'positive'
                                ? 'bg-green-100 text-green-800'
                                : deal.intelligence?.momentum === 'negative'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {deal.intelligence?.momentum || 'neutral'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                        No deals match the selected filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Batch Email Modal */}
      {showBatchEmailModal && selectedDeals.size > 0 && (
        <BatchEmailModal
          deals={filteredDeals
            .filter((d) => selectedDeals.has(d.id))
            .map((d) => ({ id: d.id, name: d.name }))}
          onClose={() => setShowBatchEmailModal(false)}
          onSuccess={() => {
            // Clear selection and refresh deals after successful email send
            setSelectedDeals(new Set());
            // Could trigger a refresh here if needed
          }}
        />
      )}
    </div>
  );
}
