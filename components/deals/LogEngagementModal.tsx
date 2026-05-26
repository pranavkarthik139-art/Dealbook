'use client';

import { useState } from 'react';

interface LogEngagementModalProps {
  contactId: number;
  contactName: string;
  dealId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const EVENT_TYPES = [
  { value: 'email_sent', label: '📧 Email Sent' },
  { value: 'email_received', label: '📬 Email Received' },
  { value: 'call_made', label: '☎️ Call Made' },
  { value: 'meeting_attended', label: '👥 Meeting Attended' },
  { value: 'message_sent', label: '💬 Message Sent' },
];

export function LogEngagementModal({
  contactId,
  contactName,
  dealId,
  onClose,
  onSuccess,
}: LogEngagementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    eventType: 'email_sent',
    eventDescription: '',
    responseTime: '',
    eventDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/contacts/${contactId}/engagement/log`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dealId,
            eventType: formData.eventType,
            eventDescription:
              formData.eventDescription || formData.eventType,
            responseTime: formData.responseTime
              ? parseInt(formData.responseTime)
              : undefined,
            eventDate: formData.eventDate
              ? new Date(formData.eventDate)
              : undefined,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to log engagement');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error logging engagement:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--theme-main-bg)',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '500px',
          padding: '36px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--theme-text-primary)',
            fontFamily: '"Playfair Display", serif',
            margin: '0 0 8px 0',
          }}
        >
          Log Activity
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--theme-text-secondary)',
            margin: '0 0 24px 0',
          }}
        >
          Recording engagement with {contactName}
        </p>

        {error && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '7px',
              fontSize: '13px',
              color: '#991b1b',
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Event Type */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--theme-text-primary)',
                marginBottom: '12px',
              }}
            >
              Type of Engagement *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {EVENT_TYPES.map((type) => (
                <label
                  key={type.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '7px',
                    border:
                      formData.eventType === type.value
                        ? '2px solid var(--theme-accent)'
                        : '1px solid var(--theme-border)',
                    backgroundColor:
                      formData.eventType === type.value
                        ? 'rgba(0, 71, 255, 0.05)'
                        : 'var(--theme-main-bg)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (formData.eventType !== type.value) {
                      e.currentTarget.style.borderColor = 'var(--theme-hover-bg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.eventType !== type.value) {
                      e.currentTarget.style.borderColor = 'var(--theme-border)';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="eventType"
                    value={type.value}
                    checked={formData.eventType === type.value}
                    onChange={(e) =>
                      setFormData({ ...formData, eventType: e.target.value })
                    }
                    style={{
                      marginRight: '10px',
                      cursor: 'pointer',
                      accentColor: 'var(--theme-accent)',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'var(--theme-text-primary)',
                      fontWeight: 500,
                    }}
                  >
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--theme-text-primary)',
                marginBottom: '8px',
              }}
            >
              Description
            </label>
            <textarea
              value={formData.eventDescription}
              onChange={(e) =>
                setFormData({ ...formData, eventDescription: e.target.value })
              }
              placeholder="e.g., Discussed POC timeline and requirements"
              rows={3}
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
                fontFamily: 'inherit',
                transition: 'border-color 150ms ease',
                resize: 'vertical',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-border)';
              }}
            />
          </div>

          {/* Event Date */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--theme-text-primary)',
                marginBottom: '8px',
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) =>
                setFormData({ ...formData, eventDate: e.target.value })
              }
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

          {/* Response Time (optional) */}
          {(formData.eventType === 'email_received' ||
            formData.eventType === 'message_sent') && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--theme-text-primary)',
                  marginBottom: '8px',
                }}
              >
                Response Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.responseTime}
                onChange={(e) =>
                  setFormData({ ...formData, responseTime: e.target.value })
                }
                placeholder="e.g., 45"
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
          )}

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '12px',
              marginTop: '8px',
            }}
          >
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
                transition: 'all 150ms ease',
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
                transition: 'all 150ms ease',
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
              {loading ? 'Logging...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
