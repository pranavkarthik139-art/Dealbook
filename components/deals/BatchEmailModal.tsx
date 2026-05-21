'use client';

import { useState } from 'react';
import { emailTemplates, getTemplateNames, renderTemplate } from '@/lib/emailTemplates';

interface Deal {
  id: number;
  name: string;
}

interface BatchEmailModalProps {
  deals: Deal[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BatchEmailModal({
  deals,
  onClose,
  onSuccess,
}: BatchEmailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [templateMode, setTemplateMode] = useState<
    'follow_up' | 'poc_reminder' | 'next_steps' | 'demo_schedule' | 'custom'
  >('follow_up');
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
  });

  const templateNames = getTemplateNames();

  // Get preview by rendering template with sample data
  const getPreview = () => {
    if (templateMode === 'custom') {
      return { subject: formData.subject, body: formData.body };
    }

    const template = emailTemplates[templateMode];
    if (!template) return { subject: '', body: '' };

    return renderTemplate(template, 'Sample Deal', 'Contact Name');
  };

  const handleTemplateChange = (newTemplate: string) => {
    if (newTemplate === 'custom') {
      setTemplateMode('custom');
      setFormData({ subject: '', body: '' });
    } else {
      const selectedTemplate =
        emailTemplates[newTemplate as keyof typeof emailTemplates];
      if (selectedTemplate) {
        setTemplateMode(newTemplate as any);
        setFormData({
          subject: selectedTemplate.subject,
          body: selectedTemplate.body,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealIds: deals.map(d => d.id),
          subject: formData.subject,
          body: formData.body,
          template: templateMode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send emails');
      }

      const data = await response.json();
      setSuccess(
        `Email sent successfully! Sent: ${data.sent}, Failed: ${data.failed}`
      );

      // Close after showing success
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error sending emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const preview = getPreview();

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
          backgroundColor: 'var(--paper)',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '700px',
          padding: '36px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--ink)',
            fontFamily: '"Playfair Display", serif',
            margin: '0 0 8px 0',
          }}
        >
          Send Batch Email
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--ink-light)',
            margin: '0 0 24px 0',
          }}
        >
          Sending to {deals.length} deal(s)
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

        {success && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 14px',
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              borderRadius: '7px',
              fontSize: '13px',
              color: '#166534',
            }}
          >
            ✓ {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Recipients Summary */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--line)',
              borderRadius: '7px',
              fontSize: '13px',
              color: 'var(--ink)',
            }}
          >
            <strong>Deals included:</strong> {deals.map(d => d.name).join(', ')}
          </div>

          {/* Template Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '10px',
              }}
            >
              Email Template
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {templateNames.map(template => (
                <button
                  key={template}
                  type="button"
                  onClick={() => handleTemplateChange(template)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '7px',
                    border:
                      templateMode === template
                        ? '2px solid var(--cobalt)'
                        : '1px solid var(--line)',
                    backgroundColor:
                      templateMode === template
                        ? 'rgba(0, 71, 255, 0.05)'
                        : 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => {
                    if (templateMode !== template) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        'var(--cobalt)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (templateMode !== template) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        'var(--line)';
                    }
                  }}
                >
                  {template.replace(/_/g, ' ').toUpperCase()}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleTemplateChange('custom')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '7px',
                  border:
                    templateMode === 'custom'
                      ? '2px solid var(--cobalt)'
                      : '1px solid var(--line)',
                  backgroundColor:
                    templateMode === 'custom'
                      ? 'rgba(0, 71, 255, 0.05)'
                      : 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => {
                  if (templateMode !== 'custom') {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      'var(--cobalt)';
                  }
                }}
                onMouseLeave={e => {
                  if (templateMode !== 'custom') {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      'var(--line)';
                  }
                }}
              >
                CUSTOM
              </button>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '8px',
              }}
            >
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Email subject line"
              required
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
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--cobalt)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            />
          </div>

          {/* Body */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '8px',
              }}
            >
              Email Body *
            </label>
            <textarea
              value={formData.body}
              onChange={e => setFormData({ ...formData, body: e.target.value })}
              placeholder="Your email message here..."
              rows={6}
              required
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
                fontFamily: 'inherit',
                transition: 'border-color 150ms ease',
                resize: 'vertical',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--cobalt)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            />
            <p
              style={{
                fontSize: '12px',
                color: 'var(--ink-light)',
                marginTop: '6px',
              }}
            >
              💡 Use {'{'}dealName{'}'} and {'{'}contactName{'}'} for personalization
            </p>
          </div>

          {/* Preview */}
          {preview.subject && (
            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--line)',
                borderRadius: '7px',
                borderLeft: '4px solid var(--cobalt)',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--ink-light)',
                  marginBottom: '8px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Preview
              </p>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  marginBottom: '8px',
                }}
              >
                {preview.subject}
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--ink)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5',
                }}
              >
                {preview.body}
              </p>
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
              disabled={loading}
              style={{
                flex: 1,
                padding: '11px 16px',
                borderRadius: '7px',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: 'var(--paper)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--line-light)';
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--paper)';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.subject || !formData.body}
              style={{
                flex: 1,
                padding: '11px 16px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: 'var(--cobalt)',
                color: 'white',
                fontWeight: 600,
                fontSize: '13px',
                cursor:
                  loading || !formData.subject || !formData.body
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  loading || !formData.subject || !formData.body ? 0.7 : 1,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => {
                if (
                  !loading &&
                  formData.subject &&
                  formData.body
                ) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--cobalt-hover)';
                }
              }}
              onMouseLeave={e => {
                if (
                  !loading &&
                  formData.subject &&
                  formData.body
                ) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--cobalt)';
                }
              }}
            >
              {loading ? 'Sending...' : `Send to ${deals.length} Deal(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
