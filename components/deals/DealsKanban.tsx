'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculateDealHealth, getHealthStatus } from '@/lib/dealHealth';
import { DealCard } from './DealCard';

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

export function DealsKanban({
  deals,
  onDealClick,
  selectedDealIds,
  onToggleSelect,
}: {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  selectedDealIds?: Set<number>;
  onToggleSelect?: (dealId: number) => void;
}) {
  const router = useRouter();
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [localDeals, setLocalDeals] = useState<Deal[]>(deals);

  const stages = [
    { id: 'demo', label: 'Demo', color: 'var(--cobalt)', deals: localDeals.filter(d => d.stage === 'demo') },
    { id: 'poc', label: 'POC', color: 'var(--amber)', deals: localDeals.filter(d => d.stage === 'poc') },
    { id: 'validation', label: 'Validation', color: 'var(--green)', deals: localDeals.filter(d => d.stage === 'validation') },
    { id: 'closed', label: 'Closed', color: 'var(--green)', deals: localDeals.filter(d => d.stage === 'closed') },
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

  const handleViewDetails = (dealId: number) => {
    router.push(`/deals/${dealId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {stages.map(stage => (
          <div key={stage.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: `3px solid ${stage.color}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink)', margin: 0 }}>{stage.label}</h3>
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
                backgroundColor: draggedCard ? 'var(--cobalt-light)' : 'var(--paper-alt)',
                border: draggedCard ? '2px dashed var(--cobalt)' : '2px dashed var(--line)',
                transition: 'all 150ms ease'
              }}
            >
              {stage.deals.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--ink-lighter)', fontSize: '12px', backgroundColor: 'var(--paper)', borderRadius: '8px', border: '1px dashed var(--line)' }}>
                  No deals in this stage
                </div>
              ) : (
                stage.deals.map(deal => {
                  const health = calculateDealHealth(deal);
                  const isDragging = draggedCard === deal.id;
                  const isSelected = selectedDealIds?.has(deal.id) ?? false;

                  return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      style={{
                        opacity: isDragging ? 0.8 : 1,
                      }}
                    >
                      <DealCard
                        id={deal.id}
                        name={deal.name}
                        amount={deal.amount}
                        stage={deal.stage}
                        lastActivityAt={deal.lastActivityAt}
                        healthScore={health}
                        stall={deal.stall}
                        email={(deal as any).email}
                        onClick={() => handleViewDetails(deal.id)}
                        isSelected={isSelected}
                        onToggleSelect={onToggleSelect ? (dealId) => onToggleSelect(dealId) : undefined}
                      />
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
