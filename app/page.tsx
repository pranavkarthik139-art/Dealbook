'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (status === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--paper-bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            fontFamily: '"Playfair Display", serif',
            color: 'var(--ink)',
            margin: '0 0 16px 0',
          }}>
            Dealbook
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--ink-lighter)',
          }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, don't show anything (will redirect above)
  if (status === 'authenticated') {
    return null;
  }

  // Show landing page for unauthenticated users
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--paper-bg)',
      padding: '32px 16px',
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 700,
          fontFamily: '"Playfair Display", serif',
          color: 'var(--ink)',
          margin: '0 0 24px 0',
          letterSpacing: '-1px',
        }}>
          Dealbook
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '18px',
          color: 'var(--ink-light)',
          margin: '0 0 32px 0',
          lineHeight: 1.6,
        }}>
          The presales dashboard that makes deal progression visible.
          <br />
          Track every interaction. Close with confidence.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '32px',
        }}>
          {/* Sign in with Google */}
          <Link
            href="/auth/signin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              backgroundColor: 'var(--cobalt)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 150ms ease',
              cursor: 'pointer',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🔐 Sign In
          </Link>
        </div>

        {/* Features List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '24px',
          marginTop: '48px',
          paddingTop: '48px',
          borderTop: '1px solid var(--line-light)',
        }}>
          <div>
            <div style={{
              fontSize: '24px',
              marginBottom: '8px',
            }}>
              📊
            </div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 4px 0',
            }}>
              Pipeline Visibility
            </h3>
            <p style={{
              fontSize: '12px',
              color: 'var(--ink-lighter)',
              margin: 0,
            }}>
              See deals at a glance
            </p>
          </div>

          <div>
            <div style={{
              fontSize: '24px',
              marginBottom: '8px',
            }}>
              ⚡
            </div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 4px 0',
            }}>
              Activity Tracking
            </h3>
            <p style={{
              fontSize: '12px',
              color: 'var(--ink-lighter)',
              margin: 0,
            }}>
              Never miss an update
            </p>
          </div>

          <div>
            <div style={{
              fontSize: '24px',
              marginBottom: '8px',
            }}>
              🎯
            </div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 4px 0',
            }}>
              Deal Health
            </h3>
            <p style={{
              fontSize: '12px',
              color: 'var(--ink-lighter)',
              margin: 0,
            }}>
              Spot risks early
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{
          fontSize: '12px',
          color: 'var(--ink-lighter)',
          margin: '48px 0 0 0',
          paddingTop: '24px',
          borderTop: '1px solid var(--line-light)',
        }}>
          © 2026 Dealbook. Built for presales teams.
        </p>
      </div>
    </div>
  );
}
