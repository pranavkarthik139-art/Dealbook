'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AssignDealButtonProps {
  dealId: number;
  dealName: string;
  onAssignSuccess?: () => void;
}

export function AssignDealButton({ dealId, dealName, onAssignSuccess }: AssignDealButtonProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [seList, setSeList] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [selectedSeId, setSelectedSeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch list of Sales Engineers
  useEffect(() => {
    if (isOpen && seList.length === 0) {
      fetchSEList();
    }
  }, [isOpen]);

  const fetchSEList = async () => {
    try {
      const response = await fetch('/api/users?role=sales_engineer');
      if (response.ok) {
        const data = await response.json();
        setSeList(data.users || []);
      }
    } catch (err) {
      setError('Failed to load sales engineers');
      console.error(err);
    }
  };

  const handleAssign = async () => {
    if (!selectedSeId) {
      setError('Please select a sales engineer');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/deals/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId,
          seUserId: selectedSeId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setIsOpen(false);
        setSelectedSeId(null);
        onAssignSuccess?.();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to assign deal');
      }
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin/presales_lead
  const userRole = (session?.user as any)?.role;
  if (!userRole || !['admin', 'presales_lead'].includes(userRole)) {
    return null;
  }

  return (
    <div>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6366F1',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        👤 Assign to SE
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>
              Assign Deal to Sales Engineer
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#666' }}>
              {dealName}
            </p>

            {/* SE Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#333',
                }}
              >
                Select Sales Engineer
              </label>
              <select
                value={selectedSeId || ''}
                onChange={(e) => setSelectedSeId(e.target.value ? parseInt(e.target.value) : null)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              >
                <option value="">-- Choose a Sales Engineer --</option>
                {seList.map((se) => (
                  <option key={se.id} value={se.id}>
                    {se.name} ({se.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Messages */}
            {error && (
              <div style={{ padding: '12px', backgroundColor: '#fee', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#c33' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '12px', backgroundColor: '#efe', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#3c3' }}>
                {success}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAssign}
                disabled={loading || !selectedSeId}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#6366F1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: loading || !selectedSeId ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {loading ? 'Assigning...' : 'Assign'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e0e0e0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
