'use client';

interface TemplateCardProps {
  id: number;
  name: string;
  dealType: string;
  usage: number;
  expectedDuration?: number | null;
  estimatedValue?: number | null;
  onEdit: (id: number) => void;
  onApply: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TemplateCard({
  id,
  name,
  dealType,
  usage,
  expectedDuration,
  estimatedValue,
  onEdit,
  onApply,
  onDelete,
}: TemplateCardProps) {
  const formatValue = (value?: number | null) => {
    if (!value) return null;
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: 'var(--shadow)',
        transition: 'all 200ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
            {name}
          </h3>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 8px',
              backgroundColor: 'var(--cobalt)',
              color: 'white',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {dealType}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--ink-lighter)', margin: 0 }}>
          Used {usage} time{usage !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {expectedDuration && (
          <div>
            <p style={{ fontSize: '11px', color: 'var(--ink-lighter)', margin: '0 0 4px 0' }}>
              Duration
            </p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
              {expectedDuration}d
            </p>
          </div>
        )}
        {estimatedValue && (
          <div>
            <p style={{ fontSize: '11px', color: 'var(--ink-lighter)', margin: '0 0 4px 0' }}>
              Est. Value
            </p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cobalt)', margin: 0 }}>
              {formatValue(Number(estimatedValue))}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onApply(id)}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: 'var(--cobalt)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Apply
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
