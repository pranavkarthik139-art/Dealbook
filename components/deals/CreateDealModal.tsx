'use client';

import { useState } from 'react';

interface CreateDealModalProps {
  onClose: () => void;
  onSuccess: (dealId: number) => void;
}

export function CreateDealModal({ onClose, onSuccess }: CreateDealModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    amount: '',
    stage: 'demo',
    closeDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || undefined,
          amount: formData.amount ? parseFloat(formData.amount) : undefined,
          stage: formData.stage,
          status: 'active',
        }),
      });

      if (!response.ok) throw new Error('Failed to create deal');
      const deal = await response.json();
      onSuccess(deal.id);
    } catch (error) {
      console.error('Error creating deal:', error);
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
        backgroundColor: 'var(--paper)',
        borderRadius: '10px',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '500px',
        padding: '36px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: '24px',
          fontFamily: '"Playfair Display", serif',
          margin: '0 0 28px 0'
        }}>
          Create New Deal
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Deal Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '8px'
            }}>
              Deal Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Acme Corp Deal"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '7px',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'var(--paper)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cobalt)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            />
          </div>

          {/* Company */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '8px'
            }}>
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g., Acme Corp"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '7px',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'var(--paper)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cobalt)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
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
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'var(--paper)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cobalt)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            />
          </div>

          {/* Amount */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '8px'
            }}>
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g., 50000"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '7px',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'var(--paper)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cobalt)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            />
          </div>

          {/* Stage */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
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
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'var(--paper)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cobalt)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            >
              <option value="demo">Demo</option>
              <option value="poc">POC</option>
              <option value="validation">Validation</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Close Date */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '8px'
            }}>
              Close Date
            </label>
            <input
              type="date"
              value={formData.closeDate}
              onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '7px',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'var(--paper)',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cobalt)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px 16px',
                borderRadius: '7px',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: 'var(--paper)',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--line-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--paper)';
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
                backgroundColor: loading ? 'var(--cobalt)' : 'var(--cobalt)',
                color: 'white',
                fontWeight: 600,
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'var(--cobalt)';
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
