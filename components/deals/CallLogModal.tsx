'use client';

import { useState } from 'react';

interface CallLogModalProps {
  dealId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (call: any) => Promise<void>;
}

export function CallLogModal({ dealId, isOpen, onClose, onSubmit }: CallLogModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    callDate: new Date().toISOString().split('T')[0],
    callTime: new Date().toTimeString().split(' ')[0],
    durationMinutes: 30,
    attendees: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const callDateTime = new Date(`${formData.callDate}T${formData.callTime}`);

      await onSubmit({
        dealId,
        title: formData.title,
        callDate: callDateTime.toISOString(),
        durationMinutes: parseInt(formData.durationMinutes as any),
        attendees: formData.attendees.split(',').map(a => a.trim()).filter(Boolean),
        notes: formData.notes || null,
      });

      // Reset form
      setFormData({
        title: '',
        callDate: new Date().toISOString().split('T')[0],
        callTime: new Date().toTimeString().split(' ')[0],
        durationMinutes: 30,
        attendees: '',
        notes: '',
      });

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a202c',
            margin: '0 0 24px 0',
            fontFamily: '"Playfair Display", serif',
          }}
        >
          📞 Log a Call
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#4a5568',
                marginBottom: '6px',
              }}
            >
              Call Title
            </label>
            <input
              type="text"
              placeholder="e.g., Technical Discovery Call"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          {/* Date and Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4a5568',
                  marginBottom: '6px',
                }}
              >
                Date
              </label>
              <input
                type="date"
                value={formData.callDate}
                onChange={(e) => setFormData({ ...formData, callDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4a5568',
                  marginBottom: '6px',
                }}
              >
                Time
              </label>
              <input
                type="time"
                value={formData.callTime}
                onChange={(e) => setFormData({ ...formData, callTime: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#4a5568',
                marginBottom: '6px',
              }}
            >
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
              min="1"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Attendees */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#4a5568',
                marginBottom: '6px',
              }}
            >
              Attendees (comma-separated)
            </label>
            <input
              type="text"
              placeholder="john@acme.com, sarah@acme.com"
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#4a5568',
                marginBottom: '6px',
              }}
            >
              Notes
            </label>
            <textarea
              placeholder="Initial call notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                minHeight: '80px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#F9FAFB',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !formData.title}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#0047FF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#0036CC';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#0047FF';
                }
              }}
            >
              {loading ? 'Logging...' : 'Log Call'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
