'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { UserProfile } from './UserProfile';
import { getTheme } from '@/lib/themes';
import { useTheme } from '@/lib/ThemeContext';

export function Sidebar() {
  const pathname = usePathname();
  const [dealCount, setDealCount] = useState(0);
  const theme = useTheme();

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

  const themeConfig = getTheme(theme);

  return (
    <aside style={{
      width: '236px',
      backgroundColor: themeConfig.sidebarColor,
      borderRight: '1px solid rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
      transition: 'background-color 300ms ease'
    }}>
      {/* Brand */}
      <div style={{
        padding: '32px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          fontFamily: '"Playfair Display", serif',
          color: '#FFFFFF',
          margin: 0,
          letterSpacing: '-0.8px',
          lineHeight: 1.1
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
              backgroundColor: isActive('/dashboard') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: '#FFFFFF',
              opacity: isActive('/dashboard') ? 1 : 0.85,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/dashboard')) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/dashboard')) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.opacity = '0.85';
              }
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>📊</span>
            Dashboard
          </Link>

          {/* Deals and Insights (Main Hub) */}
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
              backgroundColor: isActive('/deals') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: '#FFFFFF',
              opacity: isActive('/deals') ? 1 : 0.85,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/deals')) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/deals')) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.opacity = '0.85';
              }
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>📊</span>
            <span style={{ flex: 1 }}>Deals & Insights</span>
            {dealCount > 0 && (
              <span style={{
                marginLeft: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '20px',
                minWidth: '20px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '0 4px'
              }}>
                {dealCount}
              </span>
            )}
          </Link>

          {/* Note: Intelligence, Templates, Forecasting are now accessible as tabs within Deals & Insights */}

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.12)', margin: '8px 0' }} />

          {/* Automations */}
          <Link
            href="/automations"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 150ms ease',
              backgroundColor: isActive('/automations') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: '#FFFFFF',
              opacity: isActive('/automations') ? 1 : 0.85,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/automations')) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/automations')) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.opacity = '0.85';
              }
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>⚙️</span>
            Automations
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 150ms ease',
              backgroundColor: isActive('/settings') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: '#FFFFFF',
              opacity: isActive('/settings') ? 1 : 0.85,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/settings')) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/settings')) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.opacity = '0.85';
              }
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '16px' }}>⚙️</span>
            Settings
          </Link>
        </div>
      </nav>

      {/* Footer - User Profile with Menu */}
      <div style={{
        padding: '12px 12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <UserProfile
          userName="Pranav"
          userRole="Presales Lead"
          userEmail="pranav@example.com"
        />
      </div>
    </aside>
  );
}
