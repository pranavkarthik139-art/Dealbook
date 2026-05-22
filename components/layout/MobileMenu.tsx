'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const menuItems = [
    { href: '/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/deals', icon: '📊', label: 'Deals & Insights' },
    { href: '/automations', icon: '⚙️', label: 'Automations' },
    { href: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <>
      {/* Hamburger Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden"
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: '7px',
          padding: '8px 12px',
          cursor: 'pointer',
          transition: 'all 150ms ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--paper-alt)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--paper)';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className="fixed top-0 left-0 h-screen w-64 z-40 lg:hidden overflow-y-auto"
            style={{
              backgroundColor: 'var(--paper)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideInLeft 300ms ease'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '32px 24px',
              borderBottom: '1px solid var(--line)'
            }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 700,
                fontFamily: '"Playfair Display", serif',
                color: 'var(--ink)',
                margin: 0,
                letterSpacing: '-0.8px',
                lineHeight: 1.1
              }}>
                Dealbook
              </h1>
            </div>

            {/* Navigation */}
            <nav style={{ padding: '16px 12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'all 150ms ease',
                      backgroundColor: isActive(item.href) ? 'var(--paper-alt)' : 'transparent',
                      color: 'var(--ink)',
                      opacity: isActive(item.href) ? 1 : 0.85,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.backgroundColor = 'var(--paper-alt)';
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.opacity = '0.85';
                      }
                    }}
                  >
                    <span style={{ marginRight: '10px', fontSize: '16px' }}>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
