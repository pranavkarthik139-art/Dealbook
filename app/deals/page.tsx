'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DealCard } from '@/components/deals/DealCard';
import { DealFilters } from '@/components/deals/DealFilters';
import { DealCardPopup } from '@/components/deals/DealCardPopup';
import { DealsKanban } from '@/components/deals/DealsKanban';
import { CompactMetrics } from '@/components/deals/CompactMetrics';
import { DealsNav } from '@/components/deals/DealsNav';
import { exportDealsToCSV } from '@/lib/exportDeals';

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
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('kanban');
  const [selectedDealIds, setSelectedDealIds] = useState<Set<number>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: '',
    email: '',
    amount: '',
    stage: 'demo',
    status: 'active',
    leadSource: 'inbound'
  });
  const [creatingDeal, setCreatingDeal] = useState(false);

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

  const toggleDealSelection = (dealId: number) => {
    const newSelected = new Set(selectedDealIds);
    if (newSelected.has(dealId)) {
      newSelected.delete(dealId);
    } else {
      newSelected.add(dealId);
    }
    setSelectedDealIds(newSelected);
  };

  const selectAll = () => {
    setSelectedDealIds(new Set(filteredDeals.map((d) => d.id)));
  };

  const clearSelection = () => {
    setSelectedDealIds(new Set());
  };

  const bulkUpdateStage = async (newStage: string) => {
    if (selectedDealIds.size === 0) return;
    setBulkUpdating(true);

    try {
      await Promise.all(
        Array.from(selectedDealIds).map((dealId) =>
          fetch(`/api/deals/${dealId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stage: newStage }),
          })
        )
      );

      // Refresh deals
      const response = await fetch('/api/deals');
      const data = await response.json();
      setDeals(data.deals || []);
      setSelectedDealIds(new Set());
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedDealIds.size === 0) return;
    setBulkUpdating(true);

    try {
      await Promise.all(
        Array.from(selectedDealIds).map((dealId) =>
          fetch(`/api/deals/${dealId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );

      // Refresh deals
      const response = await fetch('/api/deals');
      const data = await response.json();
      setDeals(data.deals || []);
      setSelectedDealIds(new Set());
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!newDeal.name.trim()) return;

    setCreatingDeal(true);
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeal.name,
          email: newDeal.email || null,
          amount: newDeal.amount ? parseFloat(newDeal.amount) : null,
          stage: newDeal.stage,
          status: newDeal.status,
          leadSource: newDeal.leadSource || null,
        }),
      });

      if (response.ok) {
        const createdDeal = await response.json();

        // Reset and close modal
        setNewDeal({
          name: '',
          email: '',
          amount: '',
          stage: 'demo',
          status: 'active',
          leadSource: 'inbound'
        });
        setShowCreateModal(false);

        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        // Navigate to deal detail page
        router.push(`/deals/${createdDeal.id}`);
      } else {
        const error = await response.json();
        console.error('Failed to create deal:', error);
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create deal:', error);
      alert('Failed to create deal. Please try again.');
    } finally {
      setCreatingDeal(false);
    }
  };

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '100%',
      }}
    >
      {/* Success Toast */}
      {showSuccessMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'var(--success)',
            color: 'white',
            padding: '14px 20px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 10000,
            animation: 'slideIn 300ms ease-out',
          }}
        >
          ✓ Deal created successfully!
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              fontFamily: '"Playfair Display", serif',
              color: 'var(--ink)',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px'
            }}
          >
            Deals
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ink-lighter)', margin: 0 }}>
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} • Click a card to view details
          </p>
        </div>

        {/* Top Right Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--cobalt)',
              color: 'white',
              border: 'none',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            + Add Deal
          </button>
          <Link href="/deals/analytics" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '10px 16px',
                backgroundColor: 'var(--paper-alt)',
                color: 'var(--ink)',
                border: '1px solid var(--line)',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cobalt-light)';
                e.currentTarget.style.borderColor = 'var(--cobalt)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--paper-alt)';
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            >
              📊 Analytics
            </button>
          </Link>
          <button
            onClick={() => {
              exportDealsToCSV(filteredDeals, `deals-${new Date().toISOString().split('T')[0]}.csv`);
            }}
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--paper-alt)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt-light)';
              e.currentTarget.style.borderColor = 'var(--cobalt)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--paper-alt)';
              e.currentTarget.style.borderColor = 'var(--line)';
            }}
          >
            📥 Export CSV
          </button>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--paper-alt)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'kanban' ? 'var(--paper)' : 'transparent',
              color: viewMode === 'kanban' ? 'var(--cobalt)' : 'var(--ink-lighter)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              boxShadow: viewMode === 'kanban' ? 'var(--shadow-sm)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'kanban') {
                e.currentTarget.style.backgroundColor = 'var(--line-light)';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'kanban') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            📊 Pipeline
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? 'var(--paper)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--cobalt)' : 'var(--ink-lighter)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'grid') {
                e.currentTarget.style.backgroundColor = 'var(--line-light)';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'grid') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            ⊞ Grid
          </button>
        </div>
      </div>

      {/* Compact Metrics Header */}
      {!loading && deals.length > 0 && <CompactMetrics deals={deals} />}

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

      {/* Bulk Actions Toolbar */}
      {selectedDealIds.size > 0 && (
        <div
          style={{
            backgroundColor: 'var(--cobalt-light)',
            border: '2px solid var(--cobalt)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
              {selectedDealIds.size} selected
            </span>
            <button
              onClick={selectAll}
              style={{
                fontSize: '12px',
                color: 'var(--cobalt)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Select all
            </button>
            <button
              onClick={clearSelection}
              style={{
                fontSize: '12px',
                color: 'var(--cobalt)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Clear
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              onChange={(e) => {
                if (e.target.value) bulkUpdateStage(e.target.value);
                e.target.value = '';
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--cobalt)',
                backgroundColor: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
              disabled={bulkUpdating}
            >
              <option value="">Change stage...</option>
              <option value="demo">Demo</option>
              <option value="poc">POC</option>
              <option value="validation">Validation</option>
              <option value="closed">Closed</option>
            </select>

            <select
              onChange={(e) => {
                if (e.target.value) bulkUpdateStatus(e.target.value);
                e.target.value = '';
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--cobalt)',
                backgroundColor: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
              disabled={bulkUpdating}
            >
              <option value="">Change status...</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="lost">Lost</option>
            </select>

            {bulkUpdating && <span style={{ fontSize: '13px', color: 'var(--cobalt)' }}>Updating...</span>}
          </div>
        </div>
      )}

      {/* View Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--ink-lighter)' }}>
          <div style={{ fontSize: '14px', marginBottom: '16px' }}>⏳ Loading deals...</div>
          <div style={{ fontSize: '12px', color: 'var(--ink-lighter)' }}>This may take a moment</div>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 40px', backgroundColor: 'var(--paper-alt)', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: 'var(--ink-light)', marginBottom: '8px' }}>No deals found</div>
          <div style={{ fontSize: '12px', color: 'var(--ink-lighter)' }}>Try adjusting your filters or create a new deal</div>
        </div>
      ) : viewMode === 'kanban' ? (
        <DealsKanban
          deals={filteredDeals}
          onDealClick={handleCardClick}
          selectedDealIds={selectedDealIds}
          onToggleSelect={toggleDealSelection}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
              isSelected={selectedDealIds.has(deal.id)}
              onToggleSelect={(dealId, e) => {
                e.stopPropagation();
                toggleDealSelection(dealId);
              }}
            />
          ))}
        </div>
      )}

      {/* Popup Modal */}
      {selectedDeal && <DealCardPopup deal={selectedDeal} isOpen={isPopupOpen} onClose={handleClosePopup} />}

      {/* Create Deal Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 700,
                fontFamily: '"Playfair Display", serif',
                color: 'var(--ink)',
                margin: '0 0 24px 0',
              }}
            >
              Create New Deal
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Deal Name */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-lighter)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Deal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Acme Corp Q2 Implementation"
                  value={newDeal.name}
                  onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: '7px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-lighter)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g., contact@acmecorp.com"
                  value={newDeal.email}
                  onChange={(e) => setNewDeal({ ...newDeal, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: '7px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Amount */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-lighter)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Deal Amount (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 250000"
                  value={newDeal.amount}
                  onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: '7px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Lead Source */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-lighter)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Lead Source
                </label>
                <select
                  value={newDeal.leadSource}
                  onChange={(e) => setNewDeal({ ...newDeal, leadSource: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: '7px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                  <option value="referral">Referral</option>
                  <option value="partner">Partner</option>
                  <option value="event">Event</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Stage */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-lighter)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Stage
                </label>
                <select
                  value={newDeal.stage}
                  onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: '7px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="demo">Demo</option>
                  <option value="poc">POC</option>
                  <option value="validation">Validation</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-lighter)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={newDeal.status}
                  onChange={(e) => setNewDeal({ ...newDeal, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: '7px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="lost">Lost</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creatingDeal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--paper-alt)',
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: creatingDeal ? 'not-allowed' : 'pointer',
                  opacity: creatingDeal ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeal}
                disabled={creatingDeal || !newDeal.name.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--cobalt)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: creatingDeal || !newDeal.name.trim() ? 'not-allowed' : 'pointer',
                  opacity: creatingDeal || !newDeal.name.trim() ? 0.6 : 1,
                }}
              >
                {creatingDeal ? 'Creating...' : 'Create Deal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
