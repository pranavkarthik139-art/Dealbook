'use client';

import { useState, useEffect, useRef } from 'react';

interface CreateDealModalProps {
  onClose: () => void;
  onSuccess: (dealId: number) => void;
}

export function CreateDealModal({ onClose, onSuccess }: CreateDealModalProps) {
  const [loading, setLoading] = useState(false);
  const enrichTimeoutRef = useRef<NodeJS.Timeout>();

  const [formData, setFormData] = useState({
    company: '',
    email: '',
    amount: '',
    stage: 'demo',
  });

  // Debounced enrichment effect (silent - no UI feedback)
  useEffect(() => {
    if (enrichTimeoutRef.current) {
      clearTimeout(enrichTimeoutRef.current);
    }

    if (!formData.company && !formData.email) {
      return;
    }

    enrichTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/enrichment/company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            companyName: formData.company,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const enriched = result.data;

          // Auto-fill company if we got it from email
          if (!formData.company && enriched.companyName) {
            setFormData(prev => ({
              ...prev,
              company: enriched.companyName,
            }));
          }
        }
      } catch (error) {
        // Silent fail - enrichment is optional
        console.error('Enrichment error:', error);
      }
    }, 800);

    return () => {
      if (enrichTimeoutRef.current) {
        clearTimeout(enrichTimeoutRef.current);
      }
    };
  }, [formData.email, formData.company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.company) {
      alert('Company Name is required');
      return;
    }
    if (!formData.amount) {
      alert('Deal Size is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.company,
          company: formData.company,
          email: formData.email || null,
          amount: parseFloat(formData.amount),
          stage: formData.stage,
          status: 'active',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create deal');
      }
      const deal = await response.json();
      onSuccess(deal.id);
    } catch (error) {
      console.error('Error creating deal:', error);
      alert(error instanceof Error ? error.message : 'Failed to create deal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'var(--theme-main-bg)',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        width: '100%',
        maxWidth: '420px',
        padding: '32px',
      }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--theme-text-primary)',
          fontFamily: '"Playfair Display", serif',
          margin: '0 0 24px 0'
        }}>
          Create New Deal
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Company Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--theme-text-primary)',
              marginBottom: '8px'
            }}>
              Company Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g., Acme Corp"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '7px',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-primary)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'var(--theme-main-bg)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-border)';
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--theme-text-primary)',
              marginBottom: '8px'
            }}>
              Contact Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g., contact@acme.com"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '7px',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-primary)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'var(--theme-main-bg)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-border)';
              }}
            />
          </div>

          {/* Deal Size */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--theme-text-primary)',
              marginBottom: '8px'
            }}>
              Deal Size *
            </label>
            <input
              type="number"
              step="1"
              required
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g., 50000"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '7px',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-primary)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'var(--theme-main-bg)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-border)';
              }}
            />
          </div>

          {/* Stage */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--theme-text-primary)',
              marginBottom: '8px'
            }}>
              Stage
            </label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '7px',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-primary)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'var(--theme-main-bg)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-border)';
              }}
            >
              <option value="demo">Demo</option>
              <option value="poc">POC</option>
              <option value="validation">Validation</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px 16px',
                borderRadius: '7px',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-primary)',
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: 'var(--theme-main-bg)',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-main-bg)';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '11px 16px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: 'var(--theme-accent)',
                color: 'white',
                fontWeight: 600,
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-accent-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-accent)';
                }
              }}
            >
              {loading ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
