'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DemoSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F9F9F7',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: '#64748B' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.email !== 'demo@dealbook.com') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F9F9F7',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '12px',
            color: '#0F172A',
          }}>
            Setup for Demo Only
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#64748B',
            marginBottom: '24px',
          }}>
            Please sign in with the demo account first
          </p>
          <p style={{
            fontSize: '12px',
            backgroundColor: '#F0F4FB',
            padding: '12px',
            borderRadius: '6px',
            color: '#334155',
            marginBottom: '24px',
          }}>
            Email: demo@dealbook.com<br />
            Password: demo123
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6366F1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSeedData = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/seed-test-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to seed data');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#F9F9F7',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '16px',
        textAlign: 'center',
        maxWidth: '500px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '24px',
        }}>
          🚀
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '12px',
          color: '#0F172A',
          fontFamily: '"Playfair Display", serif',
        }}>
          Demo Setup
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#64748B',
          marginBottom: '32px',
          lineHeight: '1.6',
        }}>
          Click the button below to populate your Dealbook with sample deals, contacts, and activity data.
          <br />
          <br />
          This will create 4 demo deals at different stages so you can see the full product in action.
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#991B1B',
            marginBottom: '24px',
            fontSize: '14px',
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#D1FAE5',
            border: '1px solid #A7F3D0',
            borderRadius: '8px',
            color: '#065F46',
            marginBottom: '24px',
            fontSize: '14px',
          }}>
            ✅ Demo data created successfully! Redirecting...
          </div>
        )}

        <button
          onClick={handleSeedData}
          disabled={loading || success}
          style={{
            padding: '16px 48px',
            backgroundColor: loading || success ? '#CBD5E1' : '#6366F1',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: loading || success ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '16px',
            transition: 'all 200ms ease',
            width: '100%',
            opacity: loading || success ? 0.8 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading && !success) {
              e.currentTarget.style.backgroundColor = '#4F46E5';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6366F1';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {loading ? '⏳ Creating demo data...' : success ? '✅ Done!' : '🎯 Setup Demo Data'}
        </button>

        <p style={{
          fontSize: '13px',
          color: '#94A3B8',
          marginTop: '24px',
        }}>
          You're logged in as: <strong>{session?.user?.email}</strong>
        </p>
      </div>
    </div>
  );
}
