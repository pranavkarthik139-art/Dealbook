'use client';

import { useRouter } from 'next/navigation';

interface DealCardPopupProps {
  deal: {
    id: number;
    name: string;
    amount?: number;
    stage?: string;
    status?: string;
    healthScore?: number;
    lastActivityAt?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function DealCardPopup({ deal, isOpen, onClose }: DealCardPopupProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleDetailsClick = () => {
    router.push(`/deals/${deal.id}`);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
            {deal.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Amount */}
          <div>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 4px 0', fontWeight: 600 }}>
              AMOUNT
            </p>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#0047ff', margin: 0 }}>
              ${deal.amount ? (deal.amount / 1000).toFixed(0) : 0}K
            </p>
          </div>

          {/* Stage */}
          <div>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 4px 0', fontWeight: 600 }}>
              STAGE
            </p>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#dbeafe',
                color: '#0047ff',
                textTransform: 'capitalize',
              }}
            >
              {deal.stage || 'N/A'}
            </span>
          </div>

          {/* Health Score */}
          {deal.healthScore !== undefined && (
            <div>
              <p style={{ fontSize: '12px', color: '#999', margin: '0 0 4px 0', fontWeight: 600 }}>
                HEALTH
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor:
                      deal.healthScore >= 80
                        ? '#10b981'
                        : deal.healthScore >= 50
                          ? '#f59e0b'
                          : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'white',
                  }}
                >
                  {Math.round(deal.healthScore)}
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          {deal.status && (
            <div>
              <p style={{ fontSize: '12px', color: '#999', margin: '0 0 4px 0', fontWeight: 600 }}>
                STATUS
              </p>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor:
                    deal.status === 'active'
                      ? '#d1fae5'
                      : deal.status === 'on_hold'
                        ? '#fef3c7'
                        : '#fee2e2',
                  color:
                    deal.status === 'active'
                      ? '#059669'
                      : deal.status === 'on_hold'
                        ? '#d97706'
                        : '#dc2626',
                  textTransform: 'capitalize',
                }}
              >
                {deal.status.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Last Activity */}
        {deal.lastActivityAt && (
          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 4px 0', fontWeight: 600 }}>
              LAST ACTIVITY
            </p>
            <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
              {new Date(deal.lastActivityAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          >
            Close
          </button>
          <button
            onClick={handleDetailsClick}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: '#0047ff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0037d9')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0047ff')}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
