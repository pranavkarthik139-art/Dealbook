'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F9F9F7',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        maxWidth: '400px',
        width: '100%',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '8px',
          fontFamily: 'Playfair Display, serif',
          color: '#1a1a1a',
        }}>
          Hashwork
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '32px',
        }}>
          Sign in to access your presales dashboard and calendar
        </p>

        <button
          onClick={() => signIn('google', { callbackUrl })}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#0047FF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '12px',
            transition: 'background-color 150ms ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0037D9')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0047FF')}
        >
          Sign in with Google
        </button>

        <p style={{
          fontSize: '12px',
          color: '#999',
          textAlign: 'center',
          marginTop: '24px',
        }}>
          We need access to your Google Calendar to sync your calls
        </p>
      </div>
    </div>
  );
}
