'use client';

import { useState, useEffect } from 'react';
import { DealCard } from '@/components/deals/DealCard';
import { DealFilters } from '@/components/deals/DealFilters';
import { DealCardPopup } from '@/components/deals/DealCardPopup';
import { DealsKanban } from '@/components/deals/DealsKanban';
import { DealMetrics } from '@/components/deals/DealMetrics';
import { DealsNav } from '@/components/deals/DealsNav';

interface Stall {
  isStalled: boolean;
  daysStalled: number;
  risk: 'ok' | 'warning' | 'critical';
  reason: string;
  daysUntilCritical?: number;
}

interface Deal {
  id: number;
  name: string;
  amount?: number;
  stage?: string;
  status?: string;
  healthScore?: number;
  lastActivityAt?: string | null;
  createdAt: string;
  updatedAt: string;
  todos?: Array<{ completed: boolean }>;
  calendarEvents?: Array<{ startTime: string }>;
  stall?: Stall;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('kanban');

  // Filter states
  const [activityFilter, setActivityFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [stallFilter, setStallFilter] = useState('');

  // Fetch deals
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/deals');
        const data = await response.json();
        setDeals(data.deals || []);
        setFilteredDeals(data.deals || []);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = deals;

    // Activity filter
    if (activityFilter) {
      const now = new Date();
      filtered = filtered.filter((deal) => {
        if (!deal.lastActivityAt) return activityFilter === 'stale';
        const days = Math.floor((now.getTime() - new Date(deal.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
        if (activityFilter === 'today') return days === 0;
        if (activityFilter === 'week') return days <= 7;
        if (activityFilter === 'month') return days <= 30;
        if (activityFilter === 'stale') return days >= 30;
        return true;
      });
    }

    // Size filter
    if (sizeFilter) {
      filtered = filtered.filter((deal) => {
        const amount = deal.amount || 0;
        if (sizeFilter === 'small') return amount <= 50000;
        if (sizeFilter === 'medium') return amount > 50000 && amount <= 200000;
        if (sizeFilter === 'large') return amount > 200000;
        return true;
      });
    }

    // Stage filter
    if (stageFilter) {
      filtered = filtered.filter((deal) => deal.stage?.toLowerCase() === stageFilter.toLowerCase());
    }

    // Stall filter
    if (stallFilter) {
      if (stallFilter === 'active') {
        filtered = filtered.filter((deal) => !deal.stall || !deal.stall.isStalled);
      } else if (stallFilter === 'warning') {
        filtered = filtered.filter((deal) => deal.stall && deal.stall.isStalled && deal.stall.risk === 'warning');
      } else if (stallFilter === 'critical') {
        filtered = filtered.filter((deal) => deal.stall && deal.stall.isStalled && deal.stall.risk === 'critical');
      }
    }

    setFilteredDeals(filtered);
  }, [deals, activityFilter, sizeFilter, stageFilter, stallFilter]);

  const handleCardClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setTimeout(() => setSelectedDeal(null), 150);
  };

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '100%',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              fontFamily: 'Playfair Display, serif',
              color: '#1a1a1a',
              margin: '0 0 8px 0',
            }}
          >
            Deals
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} • Click a card to view details
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'kanban' ? 'white' : 'transparent',
              color: viewMode === 'kanban' ? '#0047FF' : '#666',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            Pipeline
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
              color: viewMode === 'grid' ? '#0047FF' : '#666',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <DealsNav />

      {/* Metrics Dashboard */}
      {!loading && deals.length > 0 && <DealMetrics deals={deals} />}

      {/* Filters */}
      <DealFilters
        activityValue={activityFilter}
        sizeValue={sizeFilter}
        stageValue={stageFilter}
        stallValue={stallFilter}
        onActivityChange={setActivityFilter}
        onSizeChange={setSizeFilter}
        onStageChange={setStageFilter}
        onStallChange={setStallFilter}
      />

      {/* View Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Loading deals...
        </div>
      ) : filteredDeals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No deals found matching your filters
        </div>
      ) : viewMode === 'kanban' ? (
        <DealsKanban deals={filteredDeals} onDealClick={handleCardClick} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
          }}
        >
          {filteredDeals.map((deal) => (
            <DealCard
              key={deal.id}
              id={deal.id}
              name={deal.name}
              amount={deal.amount}
              stage={deal.stage}
              healthScore={deal.healthScore}
              lastActivityAt={deal.lastActivityAt}
              stall={deal.stall}
              onClick={() => handleCardClick(deal)}
            />
          ))}
        </div>
      )}

      {/* Popup Modal */}
      {selectedDeal && <DealCardPopup deal={selectedDeal} isOpen={isPopupOpen} onClose={handleClosePopup} />}
    </div>
  );
}
