'use client';

import React from 'react';
import { format } from 'date-fns';

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = 'Engineer' }: HeaderProps) {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div style={{
      marginBottom: '32px',
      borderBottom: '1px solid var(--line)',
      paddingBottom: '24px'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
        color: 'var(--ink)',
        marginBottom: '8px',
        margin: '0 0 8px 0'
      }}>
        Good morning, {userName}
      </h1>
      <p style={{
        fontSize: '14px',
        color: 'var(--ink-lighter)',
        margin: 0
      }}>{today}</p>
    </div>
  );
}
