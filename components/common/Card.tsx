import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', onClick, style = {} }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--theme-main-bg)',
        border: '1px solid var(--theme-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-base)',
        ...style
      }}
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
        }
      }}
    >
      {children}
    </div>
  );
}
