'use client';

interface StallInfo {
  isStalled: boolean;
  daysStalled: number;
  risk: 'ok' | 'warning' | 'critical';
  reason: string;
}

interface DealCardProps {
  id: number;
  name: string;
  amount?: number | string;
  stage?: string;
  lastActivityAt?: string | null;
  healthScore?: number;
  stall?: StallInfo;
  onClick: () => void;
}

export function DealCard({ id, name, amount, stage, lastActivityAt, healthScore, stall, onClick }: DealCardProps) {
  const getHealthColor = (score?: number) => {
    if (!score) return '#d1d5db';
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getStallColor = (risk?: string) => {
    if (risk === 'critical') return { bg: '#fee2e2', text: '#dc2626', icon: '🔴' };
    if (risk === 'warning') return { bg: '#fef3c7', text: '#d97706', icon: '🟡' };
    return { bg: '#d1fae5', text: '#059669', icon: '🟢' };
  };

  const getStageBadgeColor = (stage?: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      demo: { bg: '#dbeafe', text: '#0047ff' },
      poc: { bg: '#e0e7ff', text: '#4f46e5' },
      validation: { bg: '#f3e8ff', text: '#a855f7' },
      closed: { bg: '#d1fae5', text: '#059669' },
    };
    const stageKey = stage?.toLowerCase() || 'demo';
    return colors[stageKey] || { bg: '#f3f4f6', text: '#6b7280' };
  };

  const formatAmount = (amt?: number | string) => {
    if (!amt) return null;
    const numAmount = typeof amt === 'string' ? parseFloat(amt) : amt;
    if (isNaN(numAmount)) return null;
    return numAmount >= 1000000
      ? `$${(numAmount / 1000000).toFixed(1)}M`
      : `$${(numAmount / 1000).toFixed(0)}k`;
  };

  const getDaysSinceActivity = () => {
    if (!lastActivityAt) return 'No activity';
    const days = Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Active today';
    if (days === 1) return 'Active yesterday';
    return `${days}d ago`;
  };

  const stageBadgeStyle = getStageBadgeColor(stage);

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = '#0047ff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      {/* Header: Name + Stage Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1a1a1a',
          margin: 0,
          flex: 1,
          lineHeight: 1.35
        }}>
          {name}
        </h3>
        {stage && (
          <span style={{
            display: 'inline-block',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: stageBadgeStyle.bg,
            color: stageBadgeStyle.text,
            whiteSpace: 'nowrap',
            textTransform: 'capitalize',
          }}>
            {stage}
          </span>
        )}
      </div>

      {/* Amount */}
      {amount && formatAmount(amount) && (
        <div style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#0047ff',
        }}>
          {formatAmount(amount)}
        </div>
      )}

      {/* Stall Status */}
      {stall && stall.isStalled && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          borderRadius: '6px',
          backgroundColor: getStallColor(stall.risk).bg,
          fontSize: '12px',
          fontWeight: 600,
          color: getStallColor(stall.risk).text,
        }}>
          <span>{getStallColor(stall.risk).icon}</span>
          <span>STALLED: {stall.daysStalled}d</span>
        </div>
      )}

      {/* Health Score */}
      {healthScore !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: getHealthColor(healthScore),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 700,
            color: 'white',
            flexShrink: 0
          }}>
            {Math.round(healthScore)}
          </div>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {healthScore >= 80 ? 'On track' : healthScore >= 50 ? 'Attention' : 'At risk'}
          </span>
        </div>
      )}

      {/* Activity */}
      <div style={{
        fontSize: '12px',
        color: '#999',
        borderTop: '1px solid #f0f0f0',
        paddingTop: '8px',
      }}>
        {getDaysSinceActivity()}
      </div>
    </div>
  );
}
