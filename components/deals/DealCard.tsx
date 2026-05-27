'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface DealCardProps {
  id: number;
  name: string;
  amount?: number | string;
  stage?: string;
  email?: string;
  [key: string]: any;
}

export function DealCard({
  id,
  name,
  amount,
  stage,
  email,
}: DealCardProps) {
  const router = useRouter();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/deals/${id}`);
  };

  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount || 0;
  const formattedAmount = amountNum > 0 ? `$${(amountNum / 1000).toFixed(0)}k` : '—';

  return (
    <div
      style={{
        backgroundColor: '#10B981',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '280px',
        color: 'white',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Top Section */}
      <div>
        {/* Contact */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9, margin: '0 0 8px 0' }}>
            Contact
          </p>
          <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
            {email || '—'}
          </p>
        </div>

        {/* Deal Value */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9, margin: '0 0 8px 0' }}>
            Deal Value
          </p>
          <p style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
            {formattedAmount}
          </p>
        </div>

        {/* Stage */}
        {stage && (
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9, margin: '0 0 8px 0' }}>
              Stage
            </p>
            <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <button
        onClick={handleViewDetails}
        style={{
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: '2px solid white',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        → View Deal Details
      </button>
    </div>
  );
}
