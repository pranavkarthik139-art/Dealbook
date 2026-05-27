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
  const [userRole, setUserRole] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dealsResponse = await fetch('/api/deals');
        if (dealsResponse.ok) {
          const dealsData = await dealsResponse.json();
          setDealCount(dealsData.summary?.total || 0);
        }

        const userResponse = await fetch('/api/setup/check-user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const themeConfig = getTheme(theme);

  // Determine text color based on sidebar background
  const isDarkSidebar = theme === 'dark';
  const textColor = isDarkSidebar ? '#FFFFFF' : themeConfig.textColor || '#0F172A';
  const borderColor = isDarkSidebar ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
  const hoverBgColor = isDarkSidebar ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)';
  const activeBgColor = isDarkSidebar ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <aside style={{
      width: '280px',
      backgroundColor: themeConfig.sidebarColor,
      borderRight: `1px solid ${borderColor}`,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
      transition: 'background-color 300ms ease'
    }}>
      {/* Brand */}
      <div style={{
        padding: '32px 24px',
        borderBottom: borderColor
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          fontFamily: '"Playfair Display", serif',
          color: textColor,
          margin: 0,
          letterSpacing: '-0.8px',
          lineHeight: 1.1
        }}>
          Dealbook.
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
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 150ms ease',
              backgroundColor: isActive('/dashboard') ? activeBgColor : 'transparent',
              color: textColor,
              opacity: isActive('/dashboard') ? 1 : 0.85,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/dashboard')) {
                e.currentTarget.style.backgroundColor = hoverBgColor;
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
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 150ms ease',
              backgroundColor: isActive('/deals') ? activeBgColor : 'transparent',
              color: textColor,
              opacity: isActive('/deals') ? 1 : 0.85,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/deals')) {
                e.currentTarget.style.backgroundColor = hoverBgColor;
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
                color: textColor,
                fontSize: '11px',
                fontWeight: 700,
                padding: '0 4px'
              }}>
                {dealCount}
              </span>
            )}
          </Link>

          {/* Note: Intelligence, Templates, Forecasting are now accessible as tabs within Deals & Insights */}

          {/* Team Management (Managers Only) */}
          {userRole === 'presales_lead' || userRole === 'admin' ? (
            <Link
              href="/team"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 150ms ease',
                backgroundColor: isActive('/team') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: textColor,
                opacity: isActive('/team') ? 1 : 0.85,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/team')) {
                  e.currentTarget.style.backgroundColor = hoverBgColor;
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/team')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.opacity = '0.85';
                }
              }}
            >
              Team
            </Link>
          ) : null}

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: borderColor, margin: '8px 0' }} />

          {/* Automations */}
          <Link
            href="/automations"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 150ms ease',
              backgroundColor: isActive('/automations') ? activeBgColor : 'transparent',
              color: textColor,
              opacity: isActive('/automations') ? 1 : 0.85,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/automations')) {
                e.currentTarget.style.backgroundColor = hoverBgColor;
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
            Automations
          </Link>

          {/* Link Hub */}
          <Link
            href="/links"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 150ms ease',
              backgroundColor: isActive('/links') ? activeBgColor : 'transparent',
              color: textColor,
              opacity: isActive('/links') ? 1 : 0.85,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/links')) {
                e.currentTarget.style.backgroundColor = hoverBgColor;
                e.currentTarget.style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/links')) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.opacity = '0.85';
              }
            }}
          >
            Link Hub
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 150ms ease',
              backgroundColor: isActive('/settings') ? activeBgColor : 'transparent',
              color: textColor,
              opacity: isActive('/settings') ? 1 : 0.85,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/settings')) {
                e.currentTarget.style.backgroundColor = hoverBgColor;
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
            Settings
          </Link>
        </div>
      </nav>

      {/* Footer - User Profile with Menu */}
      <div style={{
        padding: '12px 12px',
        borderTop: `1px solid ${borderColor}`
      }}>
        <UserProfile />
      </div>
    </aside>
  );
}
