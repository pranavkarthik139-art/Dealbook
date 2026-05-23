'use client';

import { useState, useEffect, useRef } from 'react';

interface CreateDealModalProps {
  onClose: () => void;
  onSuccess: (dealId: number) => void;
}

interface EnrichedData {
  companyName?: string;
  companyIndustry?: string;
  companySize?: string;
  companyWebsite?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactTitle?: string;
  contactLinkedIn?: string;
}

export function CreateDealModal({ onClose, onSuccess }: CreateDealModalProps) {
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const enrichTimeoutRef = useRef<NodeJS.Timeout>();
  const [enrichedData, setEnrichedData] = useState<EnrichedData>({});

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    amount: '',
    stage: 'demo',
    closeDate: '',
    contactFirstName: '',
    contactLastName: '',
    contactTitle: '',
    companyIndustry: '',
    companySize: '',
    companyWebsite: '',
    contactLinkedIn: '',
  });

  // Debounced enrichment effect
  useEffect(() => {
    if (enrichTimeoutRef.current) {
      clearTimeout(enrichTimeoutRef.current);
    }

    if (!formData.email || formData.email.length < 5) {
      return;
    }

    setEnriching(true);

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
          setEnrichedData(enriched);

          // Auto-fill form fields with enriched data
          setFormData(prev => ({
            ...prev,
            company: enriched.companyName || prev.company,
            name: prev.name || enriched.companyName || prev.company,
            contactFirstName: enriched.contactFirstName || prev.contactFirstName,
            contactLastName: enriched.contactLastName || prev.contactLastName,
            contactTitle: enriched.contactTitle || prev.contactTitle,
            companyIndustry: enriched.companyIndustry || prev.companyIndustry,
            companySize: enriched.companySize || prev.companySize,
            companyWebsite: enriched.companyWebsite || prev.companyWebsite,
            contactLinkedIn: enriched.contactLinkedIn || prev.contactLinkedIn,
          }));
        }
      } catch (error) {
        console.error('Enrichment error:', error);
      } finally {
        setEnriching(false);
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => {
      if (enrichTimeoutRef.current) {
        clearTimeout(enrichTimeoutRef.current);
      }
    };
  }, [formData.email, formData.company]);

  const handleCompanyChange = (value: string) => {
    setFormData({ ...formData, company: value });
    // Auto-fill deal name if it's empty
    if (!formData.name) {
      setFormData(prev => ({ ...prev, name: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.email) {
      alert('Contact Email is required');
      return;
    }
    if (!formData.amount) {
      alert('Amount is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || formData.company,
          company: formData.company || null,
          email: formData.email,
          amount: parseFloat(formData.amount),
          stage: formData.stage,
          status: 'active',
          closeDate: formData.closeDate || null,
          // Contact enrichment data
          contactFirstName: formData.contactFirstName || null,
          contactLastName: formData.contactLastName || null,
          contactTitle: formData.contactTitle || null,
          contactLinkedIn: formData.contactLinkedIn || null,
          // Company enrichment data
          companyIndustry: formData.companyIndustry || null,
          companySize: formData.companySize || null,
          companyWebsite: formData.companyWebsite || null,
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
          {/* Company (Auto-fills Deal Name) */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '8px'
            }}>
              Company Name * <span style={{ fontSize: '11px', color: 'var(--ink-subtle)', fontWeight: 400 }}>(auto-fills deal name)</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={formData.company}
              onChange={(e) => handleCompanyChange(e.target.value)}
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

          {/* Deal Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '8px'
            }}>
              Deal Name {!formData.name && formData.company && <span style={{ fontSize: '11px', color: 'var(--ink-subtle)', fontWeight: 400 }}>(auto-filled)</span>}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={formData.company ? `${formData.company} Deal` : 'e.g., Acme Corp Deal'}
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
              Contact Email * {enriching && <span style={{ fontSize: '11px', color: 'var(--cobalt)', fontWeight: 400 }}>enriching...</span>}
            </label>
            <input
              type="email"
              required
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

          {/* Contact Details Section */}
          {(formData.contactFirstName || formData.contactLastName || formData.contactTitle) && (
            <div style={{
              padding: '14px',
              backgroundColor: 'var(--line-light)',
              borderRadius: '7px',
              border: '1px solid var(--line)',
              marginTop: '-8px'
            }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-subtle)', marginBottom: '10px', margin: '0 0 10px 0' }}>
                📋 ENRICHED CONTACT INFO (from Apollo)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {formData.contactFirstName && (
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>First Name</div>
                    <div style={{ color: 'var(--ink)', fontSize: '13px' }}>{formData.contactFirstName}</div>
                  </div>
                )}
                {formData.contactLastName && (
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>Last Name</div>
                    <div style={{ color: 'var(--ink)', fontSize: '13px' }}>{formData.contactLastName}</div>
                  </div>
                )}
                {formData.contactTitle && (
                  <div style={{ fontSize: '12px', gridColumn: '1 / -1' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>Title</div>
                    <div style={{ color: 'var(--ink)', fontSize: '13px' }}>{formData.contactTitle}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Company Details Section */}
          {(formData.companyIndustry || formData.companySize || formData.companyWebsite) && (
            <div style={{
              padding: '14px',
              backgroundColor: 'var(--line-light)',
              borderRadius: '7px',
              border: '1px solid var(--line)',
              marginTop: '-8px'
            }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-subtle)', marginBottom: '10px', margin: '0 0 10px 0' }}>
                🏢 ENRICHED COMPANY INFO (from Apollo)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {formData.companyIndustry && (
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>Industry</div>
                    <div style={{ color: 'var(--ink)', fontSize: '13px' }}>{formData.companyIndustry}</div>
                  </div>
                )}
                {formData.companySize && (
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>Company Size</div>
                    <div style={{ color: 'var(--ink)', fontSize: '13px' }}>{formData.companySize}</div>
                  </div>
                )}
                {formData.companyWebsite && (
                  <div style={{ fontSize: '12px', gridColumn: '1 / -1' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>Website</div>
                    <div style={{ color: 'var(--cobalt)', fontSize: '13px', wordBreak: 'break-all' }}>{formData.companyWebsite}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Amount (Deal Size) */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: '8px'
            }}>
              Deal Size (Amount) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              min="0"
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
