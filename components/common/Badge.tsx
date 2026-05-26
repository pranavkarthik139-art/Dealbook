import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'closed' | 'on-hold' | 'lost' | 'default';
  className?: string;
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  active: { bg: 'var(--green-light)', text: 'var(--green)' },
  closed: { bg: 'var(--theme-card-bg)', text: 'var(--theme-text-secondary)' },
  'on-hold': { bg: 'var(--amber-light)', text: 'var(--amber)' },
  lost: { bg: 'var(--red-light)', text: 'var(--red)' },
  default: { bg: 'var(--theme-card-bg)', text: 'var(--theme-text-secondary)' },
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const styles = variantStyles[variant];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: 600,
        borderRadius: '20px',
        backgroundColor: styles.bg,
        color: styles.text,
        whiteSpace: 'nowrap'
      }}
      className={className}
    >
      {children}
    </span>
  );
}
