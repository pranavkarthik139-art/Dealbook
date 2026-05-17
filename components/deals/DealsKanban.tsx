'use client';

import { useState, useEffect } from 'react';
import { calculateDealHealth, getHealthStatus } from '@/lib/dealHealth';

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
  lastActivityAt?: string | null;
  createdAt: string;
  updatedAt: string;
  todos?: Array<{ completed: boolean }>;
  calendarEvents?: Array<{ startTime: string }>;
  stall?: Stall;
}

export function DealsKanban({ deals, onDealClick }: { deals: Deal[]; onDealClick: (deal: Deal) => void }) {
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [localDeals, setLocalDeals] = useState<Deal[]>(deals);

  const stages = [
    { id: 'demo', label: 'Demo', color: '#0047FF', deals: localDeals.filter(d => d.stage === 'demo') },
    { id: 'poc', label: 'POC', color: '#7C3AED', deals: localDeals.filter(d => d.stage === 'poc') },
    { id: 'validation', label: 'Validation', color: '#F59E0B', deals: localDeals.filter(d => d.stage === 'validation') },
    { id: 'closed', label: 'Closed', color: '#10B981', deals: localDeals.filter(d => d.stage === 'closed') },
  ];

  useEffect(() => {
    setLocalDeals(deals);
  }, [deals]);

  const totalValue = localDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);

  const getStageValue = (stageDeals: Deal[]) => {
    return stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dealId: number) => {
    setDraggedCard(dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStageId: string) => {
    e.preventDefault();
    if (!draggedCard) return;

    const deal = localDeals.find(d => d.id === draggedCard);
    if (!deal || deal.stage === newStageId) {
      setDraggedCard(null);
      return;
    }

    // Optimistic update: move card immediately in UI
    const updatedDeals = localDeals.map(d =>
      d.id === draggedCard ? { ...d, stage: newStageId } : d
    );
    setLocalDeals(updatedDeals);
    setDraggedCard(null);

    // Then sync with server
    try {
      const response = await fetch(`/api/deals/${draggedCard}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStageId }),
      });

      if (!response.ok) {
        // Revert on error
        setLocalDeals(localDeals);
        throw new Error('Failed to update deal stage');
      }

      console.log(`✅ Deal ${draggedCard} moved to ${newStageId}`);
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#f9f9f7', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', margin: '0 0 8px 0' }}>TOTAL PIPELINE</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
            ${(totalValue / 1000000).toFixed(1)}M
          </p>
        </div>
        {stages.map(stage => (
          <div key={stage.id} style={{ backgroundColor: '#f9f9f7', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#999', fontWeight: '600', margin: '0 0 8px 0' }}>{stage.label.toUpperCase()}</p>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px 0' }}>{stage.deals.length} deals</p>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              ${(getStageValue(stage.deals) / 1000000).toFixed(1)}M
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {stages.map(stage => (
          <div key={stage.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '3px solid ' + stage.color }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>{stage.label}</h3>
              <span style={{ backgroundColor: stage.color, color: 'white', borderRadius: '12px', padding: '4px 8px', fontSize: '12px', fontWeight: '600' }}>
                {stage.deals.length}
              </span>
            </div>
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '400px',
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: draggedCard ? '#E8F0FF' : '#F9F9F7',
                border: draggedCard ? '2px dashed #0047FF' : '2px dashed #e5e7eb',
                transition: 'all 150ms ease'
              }}
            >
              {stage.deals.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#999', fontSize: '12px', backgroundColor: '#f9f9f7', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
                  No deals
                </div>
              ) : (
                stage.deals.map(deal => {
                  const health = calculateDealHealth(deal);
                  const healthStatus = getHealthStatus(health);
                  const healthColor = healthStatus.color === 'green' ? '#10B981' : healthStatus.color === 'amber' ? '#F59E0B' : '#EF4444';
                  const healthBgColor = healthStatus.color === 'green' ? '#D1FAE5' : healthStatus.color === 'amber' ? '#FEF3C7' : '#FEE2E2';
                  const healthTextColor = healthStatus.color === 'green' ? '#065F46' : healthStatus.color === 'amber' ? '#92400E' : '#7F1D1D';
                  const isDragging = draggedCard === deal.id;

                  return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onClick={() => onDealClick(deal)}
                      style={{
                        backgroundColor: isDragging ? '#F0F0F0' : 'white',
                        border: isDragging ? '2px solid #0047FF' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        cursor: 'grab',
                        transition: 'all 150ms ease',
                        boxShadow: isDragging ? '0 8px 24px rgba(0,71,255,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
                        opacity: isDragging ? 0.8 : 1,
                      }}
                      onMouseEnter={e => {
                        if (!isDragging) {
                          const target = e.currentTarget as HTMLElement;
                          target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          target.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isDragging) {
                          const target = e.currentTarget as HTMLElement;
                          target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                          target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0' }}>
                        {deal.name}
                      </h4>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: '#0047FF', margin: '0 0 12px 0' }}>
                        ${(deal.amount || 0) / 1000}k
                      </p>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        {deal.status && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: deal.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                              color: deal.status === 'active' ? '#065F46' : '#7F1D1D',
                            }}
                          >
                            {deal.status.toUpperCase()}
                          </span>
                        )}
                        {deal.stall && deal.stall.isStalled && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: deal.stall.risk === 'critical' ? '#FEE2E2' : '#FEF3C7',
                              color: deal.stall.risk === 'critical' ? '#DC2626' : '#D97706',
                            }}
                          >
                            {deal.stall.risk === 'critical' ? '🔴' : '🟡'} STALLED {deal.stall.daysStalled}D
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          borderTop: '1px solid #e5e7eb',
                          paddingTop: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '14px',
                              backgroundColor: healthBgColor,
                              color: healthTextColor,
                              border: '2px solid ' + healthColor,
                            }}
                          >
                            {health}
                          </div>
                          <span style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>
                            {healthStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
