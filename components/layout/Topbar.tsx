'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateDealModal } from '@/components/deals/CreateDealModal';

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
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

        {/* Right: Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
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
