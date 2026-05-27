'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  // Get user data from session
  const userName = session?.user?.name || 'User';
  const userRole = (session?.user as any)?.role || 'Team Member';
  const userEmail = session?.user?.email || 'user@example.com';

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        borderRadius: '6px',
        gap: '10px',
      }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            animation: 'pulse 2s infinite'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{
            height: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
            marginBottom: '4px',
            width: '80px'
          }} />
          <div style={{
            height: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            width: '60px'
          }} />
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Profile Settings', href: '#', section: 'profile' },
    { label: 'RBAC & Permissions', href: '#', section: 'rbac' },
    { label: 'Integrations', href: '#', section: 'integrations' },
    { label: 'Preferences', href: '#', section: 'preferences' },
    { label: 'Team Settings', href: '#', section: 'team' },
    { label: 'Sign Out', href: '/api/auth/signout', section: 'logout' },
  ];

  return (
    <div style={{
      position: 'relative'
    }}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          border: 'none',
          gap: '10px',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700,
            flexShrink: 0
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </div>

        {/* Name + Role */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textAlign: 'left'
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              margin: '0 0 2px 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {userName}
          </p>
          <p
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.75)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {userRole}
          </p>
        </div>

        {/* Chevron */}
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.75)',
            transition: 'transform 150ms ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          ▼
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fade-up 200ms ease both'
          }}
        >
          {/* User Info Header */}
          <div
            style={{
              padding: 'var(--space-4)',
              borderBottom: '1px solid var(--line-light)',
              backgroundColor: 'var(--paper-alt)'
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: 'var(--ink-lighter)',
                margin: 0,
                marginBottom: '4px'
              }}
            >
              Signed in as
            </p>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink)',
                margin: 0
              }}
            >
              {userEmail}
            </p>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '8px 0' }}>
            {menuItems.map((item) => (
              <Link
                key={item.section}
                href={item.href}
                onClick={() => {
                  if (item.section !== 'logout') {
                    setIsOpen(false);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: item.section === 'logout' ? 'var(--error)' : 'var(--ink)',
                  textDecoration: 'none',
                  transition: 'all 150ms ease',
                  gap: '10px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    item.section === 'logout' ? 'var(--error-light)' : 'var(--line-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}