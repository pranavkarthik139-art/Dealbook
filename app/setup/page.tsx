'use client';

import { useEffect, useState } from 'react';

interface UserInfo {
  authenticated: boolean;
  id?: number;
  email?: string;
  name?: string;
  role?: string;
  isManager?: boolean;
  error?: string;
}

export default function SetupPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/setup/check-user');
        const data = await response.json();
        setUserInfo(data);
      } catch (error) {
        console.error('Error checking user:', error);
        setUserInfo({ authenticated: false, error: 'Failed to fetch user info' });
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleSetRole = async (newRole: string) => {
    if (!userInfo?.email) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/users/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          role: newRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserInfo(prev => prev ? {
          ...prev,
          role: newRole,
          isManager: newRole === 'presales_lead' || newRole === 'admin',
        } : null);
        alert(`Role updated to ${newRole}. Please refresh the page.`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading user information...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontFamily: '"Playfair Display", serif', marginBottom: '30px' }}>
        Setup & Account Information
      </h1>

      {!userInfo?.authenticated ? (
        <div style={{
          padding: '20px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33',
        }}>
          <p style={{ margin: 0 }}>
            {userInfo?.error || 'You are not logged in. Please sign in first.'}
          </p>
        </div>
      ) : (
        <div>
          <div style={{
            padding: '20px',
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: '10px',
            marginBottom: '30px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Current User</h2>

            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--ink-subtle)', marginBottom: '4px', fontWeight: 600 }}>
                  Name
                </label>
                <p style={{ margin: 0, fontSize: '14px' }}>{userInfo.name}</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--ink-subtle)', marginBottom: '4px', fontWeight: 600 }}>
                  Email
                </label>
                <p style={{ margin: 0, fontSize: '14px' }}>{userInfo.email}</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--ink-subtle)', marginBottom: '4px', fontWeight: 600 }}>
                  Current Role
                </label>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: userInfo.isManager ? '#efe' : '#eef',
                  border: `1px solid ${userInfo.isManager ? '#0a0' : '#00a'}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: userInfo.isManager ? '#060' : '#006',
                  display: 'inline-block',
                }}>
                  {userInfo.role}
                  {userInfo.isManager && ' ✓ (Manager)'}
                </div>
              </div>
            </div>
          </div>

          {!userInfo.isManager && (
            <div style={{
              padding: '20px',
              backgroundColor: '#fef3cd',
              border: '1px solid #ffecb5',
              borderRadius: '10px',
              marginBottom: '30px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#664d03' }}>
                ⚠️ Not a Manager Yet
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#664d03' }}>
                Your current role is <strong>{userInfo.role}</strong>. To access the team management dashboard and assign deals to Sales Engineers, you need to be a manager (presales_lead or admin).
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleSetRole('presales_lead')}
                  disabled={updating}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#ffc107',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#000',
                    fontWeight: 600,
                    cursor: updating ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    opacity: updating ? 0.6 : 1,
                  }}
                >
                  {updating ? 'Updating...' : 'Set as Manager'}
                </button>
                <button
                  onClick={() => handleSetRole('admin')}
                  disabled={updating}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#dc3545',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontWeight: 600,
                    cursor: updating ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    opacity: updating ? 0.6 : 1,
                  }}
                >
                  {updating ? 'Updating...' : 'Set as Admin'}
                </button>
              </div>
            </div>
          )}

          {userInfo.isManager && (
            <div style={{
              padding: '20px',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '10px',
              marginBottom: '30px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#155724' }}>
                ✓ Manager Access Enabled
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#155724' }}>
                You can now access the team management dashboard to view all Sales Engineers and assign deals.
              </p>
            </div>
          )}

          <div style={{
            padding: '20px',
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: '10px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Available Roles</h2>

            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0' }}>sales_engineer</p>
                <p style={{ fontSize: '12px', color: 'var(--ink-subtle)', margin: 0 }}>
                  Can view only their own deals. No manager access.
                </p>
              </div>

              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0' }}>presales_lead (Manager)</p>
                <p style={{ fontSize: '12px', color: 'var(--ink-subtle)', margin: 0 }}>
                  Can view all deals, assign deals to SEs, see team performance.
                </p>
              </div>

              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0' }}>admin</p>
                <p style={{ fontSize: '12px', color: 'var(--ink-subtle)', margin: 0 }}>
                  Full access including user role management.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <a
              href="/team"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: 'var(--cobalt)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Go to Team Management →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
