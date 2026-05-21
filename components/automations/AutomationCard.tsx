'use client';

import {
  getTriggerDescription,
  getActionDescription,
} from '@/lib/automationEngine';

interface AutomationCardProps {
  id: number;
  name: string;
  trigger: string;
  triggerConfig: any;
  action: string;
  actionConfig: any;
  enabled: boolean;
  onEdit: (id: number) => void;
  onToggle: (id: number, enabled: boolean) => void;
  onDelete: (id: number) => void;
  onViewHistory: (id: number) => void;
}

export function AutomationCard({
  id,
  name,
  trigger,
  triggerConfig,
  action,
  actionConfig,
  enabled,
  onEdit,
  onToggle,
  onDelete,
  onViewHistory,
}: AutomationCardProps) {
  const triggerDesc = getTriggerDescription(trigger as any, triggerConfig);
  const actionDesc = getActionDescription(action as any, actionConfig);

  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        border: `2px solid ${enabled ? 'var(--green-light)' : 'var(--line)'}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: 'var(--shadow)',
        transition: 'all 200ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', margin: 0, marginBottom: '4px' }}>
            {name}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--ink-lighter)', margin: 0 }}>
            {enabled ? '🟢 Active' : '⚫ Inactive'}
          </p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(id, e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: 'var(--green)',
            }}
          />
        </label>
      </div>

      {/* Flow */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--paper-alt)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cobalt)', textTransform: 'uppercase' }}>
            When
          </span>
          <span style={{ fontSize: '13px', color: 'var(--ink)' }}>
            {triggerDesc}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase' }}>
            Then
          </span>
          <span style={{ fontSize: '13px', color: 'var(--ink)' }}>
            {actionDesc}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onViewHistory(id)}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: 'var(--paper-alt)',
            color: 'var(--ink)',
            border: '1px solid var(--line)',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--line)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--paper-alt)';
          }}
        >
          History
        </button>
        <button
          onClick={() => onEdit(id)}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: 'var(--paper-alt)',
            color: 'var(--ink)',
            border: '1px solid var(--line)',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--line)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--paper-alt)';
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(id)}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: 'var(--red)',
            border: '1px solid var(--red-light)',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--red-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
