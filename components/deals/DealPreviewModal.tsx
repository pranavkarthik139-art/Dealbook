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
          backgroundColor: 'var(--theme-main-bg)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: '24px',
          maxHeight: '80vh',
          overflowY: 'auto',
          zIndex: 50,
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
          animation: 'slideUp 300ms ease',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--theme-text-tertiary)',
            padding: '8px',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h2
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--theme-text-primary)',
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
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  backgroundColor: 'var(--theme-accent-light)',
                  color: 'var(--theme-accent)',
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
              color: 'var(--theme-accent)',
              marginBottom: '8px',
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
                padding: '8px 12px',
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
            gap: '16px',
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid var(--theme-border)',
          }}
        >
          {/* Health */}
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--theme-text-tertiary)', margin: 0, marginBottom: '8px', fontWeight: 500 }}>
              HEALTH
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--theme-text-primary)', margin: 0 }}>
                  {getHealthStatus(deal.healthScore)}
                </p>
              </div>
            </div>
          </div>

          {/* Stall Status */}
          {deal.stall ? (
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--theme-text-tertiary)', margin: 0, marginBottom: '8px', fontWeight: 500 }}>
                STALL STATUS
              </p>
              <div
                style={{
                  padding: '8px 12px',
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
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--theme-text-tertiary)', margin: 0, marginBottom: '8px', fontWeight: 500 }}>
                LAST ACTIVITY
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--theme-text-primary)', margin: 0, fontWeight: 600 }}>
                {deal.lastActivityAt
                  ? new Date(deal.lastActivityAt).toLocaleDateString()
                  : 'No activity'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onViewDetails(deal.id)}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: 'var(--theme-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-accent-dark)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-accent)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            View Full Details →
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--theme-card-bg)',
              color: 'var(--theme-text-primary)',
              border: '1px solid var(--theme-border)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)';
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
