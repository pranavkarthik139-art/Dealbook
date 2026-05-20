'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = 'Engineer' }: HeaderProps) {
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting('Good morning');
      } else if (hour < 18) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      marginBottom: 'var(--space-8)',
      paddingBottom: 0
    }}>
      <h1 style={{
        fontSize: 'var(--text-4xl)',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
        color: 'var(--ink)',
        margin: 0,
        letterSpacing: '-0.5px',
        textDecoration: 'underline',
        textDecorationThickness: '2px',
        textUnderlineOffset: '6px',
        textDecorationColor: 'var(--ink)'
      }}>
        {greeting}, {userName}
      </h1>
    </div>
  );
}
