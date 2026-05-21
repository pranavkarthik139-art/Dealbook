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
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--space-6)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-base)',
        ...style
      }}
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      {children}
    </div>
  );
}
