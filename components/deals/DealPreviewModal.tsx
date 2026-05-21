'use client';

import React from 'react';

interface StallInfo {
  isStalled: boolean;
  daysStalled: number;
  risk: 'ok' | 'warning' | 'critical';
  reason: string;
}

interface DealPreviewModalProps {
  deal: {
    id: number;
    name: string;
    amount?: number;
    stage?: string;
    status?: string;
    lastActivityAt?: string | null;
    healthScore?: number;
    stall?: StallInfo;
  } | null;
  onClose: () => void;
  onViewDetails: (dealId: number) => void;
}

export function DealPreviewModal({ deal, onClose, onViewDetails }: DealPreviewModalProps) {
  if (!deal) return null;

  const getHealthColor = (score?: number) => {
    if (!score) return '#64748b';
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getHealthStatus = (score?: number) => {
    if (!score) return 'No score';
    if (score >= 80) return 'On track';
    if (score >= 50) return 'Needs attention';
    return 'At risk';
  };

  const formatAmount = (amt?: number) => {
    if (!amt) return '—';
    return amt >= 1000000
      ? `$${(amt / 1000000).toFixed(1)}M`
      : `$${(amt / 1000).toFixed(0)}k`;
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 40,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--paper)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: 'var(--space-6)',
          maxHeight: '80vh',
          overflowY: 'auto',
          zIndex: 50,
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideUp 300ms ease',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 'var(--space-4)',
            right: 'var(--space-4)',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--ink-lighter)',
            padding: 'var(--space-2)',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
            <h2
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
                flex: 1,
              }}
            >
              {deal.name}
            </h2>
            {deal.stage && (
              <span
                style={{
                  display: 'inline-block',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  backgroundColor: 'var(--cobalt-light)',
                  color: 'var(--cobalt)',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}
              >
                {deal.stage}
              </span>
            )}
          </div>

          {/* Amount */}
          <div
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 700,
              color: 'var(--cobalt)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {formatAmount(deal.amount)}
          </div>

          {/* Status */}
          {deal.status && (
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: deal.status === 'active' ? '#065f46' : '#7f1d1d',
                backgroundColor: deal.status === 'active' ? '#d1fae5' : '#fee2e2',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius)',
                display: 'inline-block',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {deal.status}
            </div>
          )}
        </div>

        {/* Key Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-6)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          {/* Health */}
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-lighter)', margin: 0, marginBottom: 'var(--space-2)', fontWeight: 500 }}>
              HEALTH
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: getHealthColor(deal.healthScore),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                {Math.round(deal.healthScore || 0)}
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                  {getHealthStatus(deal.healthScore)}
                </p>
              </div>
            </div>
          </div>

          {/* Stall Status */}
          {deal.stall ? (
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-lighter)', margin: 0, marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                STALL STATUS
              </p>
              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius)',
                  backgroundColor:
                    deal.stall.risk === 'critical'
                      ? '#fee2e2'
                      : deal.stall.risk === 'warning'
                        ? '#fef3c7'
                        : '#d1fae5',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color:
                    deal.stall.risk === 'critical'
                      ? '#7f1d1d'
                      : deal.stall.risk === 'warning'
                        ? '#92400e'
                        : '#065f46',
                }}
              >
                {deal.stall.risk === 'critical' ? '🔴' : deal.stall.risk === 'warning' ? '🟡' : '🟢'} Stalled {deal.stall.daysStalled}d
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-lighter)', margin: 0, marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                LAST ACTIVITY
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)', margin: 0, fontWeight: 600 }}>
                {deal.lastActivityAt
                  ? new Date(deal.lastActivityAt).toLocaleDateString()
                  : 'No activity'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={() => onViewDetails(deal.id)}
            style={{
              flex: 1,
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--cobalt)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            View Full Details →
          </button>
          <button
            onClick={onClose}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--paper-alt)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--line-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--paper-alt)';
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
