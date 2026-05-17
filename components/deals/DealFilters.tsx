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
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {/* Activity Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Activity:</label>
        <select
          value={activityValue}
          onChange={(e) => onActivityChange(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: 'white',
          }}
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
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Size:</label>
        <select
          value={sizeValue}
          onChange={(e) => onSizeChange(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: 'white',
          }}
        >
          <option value="">All</option>
          <option value="small">Small ($0 - $50K)</option>
          <option value="medium">Medium ($50K - $200K)</option>
          <option value="large">Large ($200K+)</option>
        </select>
      </div>

      {/* Stage Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Stage:</label>
        <select
          value={stageValue}
          onChange={(e) => onStageChange(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: 'white',
          }}
        >
          <option value="">All</option>
          <option value="demo">Demo</option>
          <option value="poc">POC</option>
          <option value="validation">Validation</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Health Score Filter */}
      {onHealthChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Health:</label>
          <select
            value={healthValue}
            onChange={(e) => onHealthChange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              cursor: 'pointer',
              backgroundColor: 'white',
            }}
          >
            <option value="">All</option>
            <option value="on-track">On Track (80+)</option>
            <option value="needs-attention">Needs Attention (50-79)</option>
            <option value="at-risk">At Risk (0-49)</option>
          </select>
        </div>
      )}

      {/* Stall Status Filter */}
      {onStallChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Stall:</label>
          <select
            value={stallValue}
            onChange={(e) => onStallChange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              cursor: 'pointer',
              backgroundColor: 'white',
            }}
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
