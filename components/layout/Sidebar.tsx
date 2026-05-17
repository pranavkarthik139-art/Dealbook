'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const [dealCount, setDealCount] = useState(0);

  useEffect(() => {
    fetch('/api/deals')
      .then(res => res.json())
      .then(data => setDealCount(data.summary?.total || 0))
      .catch(() => setDealCount(0));
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: '236px',
      backgroundColor: 'var(--paper)',
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand */}
      <div style={{
        padding: '24px 24px',
        borderBottom: '1px solid var(--line-light)'
      }}>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 700,
          fontFamily: '"Playfair Display", serif',
          color: 'var(--ink)',
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          Dealbook
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Dashboard */}
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 150ms ease',
              backgroundColor: isActive('/dashboard') ? 'var(--cobalt-light)' : 'transparent',
              color: isActive('/dashboard') ? 'var(--cobalt)' : 'var(--ink-lighter)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/dashboard')) {
                e.currentTarget.style.backgroundColor = 'var(--line-light)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/dashboard')) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>📊</span>
            Dashboard
          </Link>

          {/* Deals and Insights */}
          <Link
            href="/deals"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 150ms ease',
              backgroundColor: isActive('/deals') ? 'var(--cobalt-light)' : 'transparent',
              color: isActive('/deals') ? 'var(--cobalt)' : 'var(--ink-lighter)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/deals')) {
                e.currentTarget.style.backgroundColor = 'var(--line-light)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/deals')) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>🤝</span>
            <span style={{ flex: 1 }}>Deals and Insights</span>
            {dealCount > 0 && (
              <span style={{
                marginLeft: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '20px',
                minWidth: '20px',
                borderRadius: '50%',
                backgroundColor: 'var(--cobalt)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 700,
                padding: '0 4px'
              }}>
                {dealCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Footer - User Info */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid var(--line-light)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background-color 150ms ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--line-light)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--cobalt)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700,
            marginRight: '10px',
            flexShrink: 0
          }}>
            T
          </div>
          <div style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 2px 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>Team</p>
            <p style={{
              fontSize: '12px',
              color: 'var(--ink-lighter)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>Engineer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
