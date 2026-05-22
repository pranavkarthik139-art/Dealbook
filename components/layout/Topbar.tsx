'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { CreateDealModal } from '@/components/deals/CreateDealModal';
import { TimezoneSelector } from '@/components/dashboard/TimezoneSelector';

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getBreadcrumb = () => {
    if (pathname === '/deals') return 'Deals';
    if (pathname.startsWith('/deals/')) return 'Deal Details';
    return 'Dashboard';
  };

  return (
    <>
      <header style={{
        height: '64px',
        backgroundColor: 'var(--paper)',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '32px',
        paddingRight: '32px',
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Left: Breadcrumb */}
        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--ink-light)'
        }}>
          {getBreadcrumb()}
        </div>

        {/* Right: Timezone Selector + Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Timezone Selector */}
          <TimezoneSelector />

          {session && (
            <button
              onClick={() => setShowCreateModal(true)}
              type="button"
              style={{
                padding: '10px 18px',
                backgroundColor: 'var(--cobalt)',
                color: 'white',
                border: 'none',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cobalt)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              + New Deal
            </button>
          )}

          {/* Auth Status & Profile */}
          {status === 'loading' ? (
            <div style={{
              padding: '8px 12px',
              color: 'var(--ink-light)',
              fontSize: '13px'
            }}>
              Loading...
            </div>
          ) : session ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* User Profile Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--paper-alt)',
                borderRadius: '7px',
                borderLeft: '3px solid var(--success)'
              }}>
                <span style={{ fontSize: '14px' }}>✓</span>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--ink-lighter)',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                    margin: 0
                  }}>
                    Synced
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--ink)',
                    fontWeight: 500,
                    margin: 0
                  }}>
                    {session.user?.name || session.user?.email?.split('@')[0] || 'User'}
                  </p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => signOut()}
                type="button"
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  color: 'var(--ink-lighter)',
                  border: '1px solid var(--line)',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--error-light)';
                  e.currentTarget.style.color = 'var(--error)';
                  e.currentTarget.style.borderColor = 'var(--error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--ink-lighter)';
                  e.currentTarget.style.borderColor = 'var(--line)';
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              type="button"
              style={{
                padding: '8px 14px',
                backgroundColor: 'var(--cobalt)',
                color: 'white',
                border: 'none',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cobalt)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      {showCreateModal && (
        <CreateDealModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            router.push('/deals');
          }}
        />
      )}
    </>
  );
}
