'use client';

interface DealFiltersProps {
  onActivityChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onHealthChange?: (value: string) => void;
  onStallChange?: (value: string) => void;
  activityValue: string;
  sizeValue: string;
  stageValue: string;
  healthValue?: string;
  stallValue?: string;
}

const selectStyle = {
  padding: '8px 12px',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--line)',
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
  backgroundColor: 'var(--paper)',
  color: 'var(--ink)',
  fontFamily: 'inherit',
  transition: 'all 150ms ease',
} as const;

export function DealFilters({
  onActivityChange,
  onSizeChange,
  onStageChange,
  onHealthChange,
  onStallChange,
  activityValue,
  sizeValue,
  stageValue,
  healthValue = '',
  stallValue = '',
}: DealFiltersProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {/* Activity Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-lighter)', textTransform: 'uppercase' }}>Activity:</label>
        <select
          value={activityValue}
          onChange={(e) => onActivityChange(e.target.value)}
          style={selectStyle}
        >
          <option value="">All</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="stale">Stale (30+ days)</option>
        </select>
      </div>

      {/* Deal Size Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-lighter)', textTransform: 'uppercase' }}>Size:</label>
        <select
          value={sizeValue}
          onChange={(e) => onSizeChange(e.target.value)}
          style={selectStyle}
        >
          <option value="">All</option>
          <option value="small">Small ($0 - $50K)</option>
          <option value="medium">Medium ($50K - $200K)</option>
          <option value="large">Large ($200K+)</option>
        </select>
      </div>

      {/* Stage Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-lighter)', textTransform: 'uppercase' }}>Stage:</label>
        <select
          value={stageValue}
          onChange={(e) => onStageChange(e.target.value)}
          style={selectStyle}
        >
          <option value="">All</option>
          <option value="demo">Demo</option>
          <option value="poc">POC</option>
          <option value="validation">Validation</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Stall Status Filter */}
      {onStallChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-lighter)', textTransform: 'uppercase' }}>Stall:</label>
          <select
            value={stallValue}
            onChange={(e) => onStallChange(e.target.value)}
            style={selectStyle}
          >
            <option value="">All</option>
            <option value="active">Active (No Stall)</option>
            <option value="warning">Warning (7-14 days)</option>
            <option value="critical">Critical (14+ days)</option>
          </select>
        </div>
      )}
    </div>
  );
}
