'use client';

import { useState } from 'react';

interface LinkFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    id?: number;
    title: string;
    url: string;
    description?: string;
    category?: string;
    linkType?: 'internal' | 'public';
    isPublic?: boolean;
    expiresAt?: string;
  };
  categories: string[];
}

export function LinkForm({ onSubmit, onCancel, initialData, categories }: LinkFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    url: initialData?.url || '',
    description: initialData?.description || '',
    category: initialData?.category || 'general',
    linkType: initialData?.linkType || 'internal',
    isPublic: initialData?.isPublic || false,
    expiresAt: initialData?.expiresAt || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '6px',
        }}>
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g., Sales Demo Deck"
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid var(--line-light)',
            borderRadius: '6px',
            backgroundColor: 'var(--paper)',
            color: 'var(--ink)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* URL */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '6px',
        }}>
          URL *
        </label>
        <input
          type="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          required
          placeholder="https://example.com"
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid var(--line-light)',
            borderRadius: '6px',
            backgroundColor: 'var(--paper)',
            color: 'var(--ink)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Description */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '6px',
        }}>
          Description (optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add notes about this link..."
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid var(--line-light)',
            borderRadius: '6px',
            backgroundColor: 'var(--paper)',
            color: 'var(--ink)',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Category */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--ink)',
          marginBottom: '6px',
        }}>
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid var(--line-light)',
            borderRadius: '6px',
            backgroundColor: 'var(--paper)',
            color: 'var(--ink)',
            boxSizing: 'border-box',
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Link Type */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--ink)',
          cursor: 'pointer',
        }}>
          <input
            type="radio"
            name="linkType"
            value="internal"
            checked={formData.linkType === 'internal'}
            onChange={handleChange}
            style={{ cursor: 'pointer' }}
          />
          🔒 Internal
        </label>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--ink)',
          cursor: 'pointer',
        }}>
          <input
            type="radio"
            name="linkType"
            value="public"
            checked={formData.linkType === 'public'}
            onChange={handleChange}
            style={{ cursor: 'pointer' }}
          />
          🔓 Public
        </label>
      </div>

      {/* Make Public Toggle */}
      {formData.linkType === 'public' && (
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--ink)',
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            style={{ cursor: 'pointer' }}
          />
          Generate shareable link
        </label>
      )}

      {/* Expiration Date */}
      {formData.isPublic && (
        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--ink)',
            marginBottom: '6px',
          }}>
            Expiration Date (optional)
          </label>
          <input
            type="datetime-local"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid var(--line-light)',
              borderRadius: '6px',
              backgroundColor: 'var(--paper)',
              color: 'var(--ink)',
              boxSizing: 'border-box',
            }}
          />
          <p style={{
            fontSize: '11px',
            color: 'var(--ink-lighter)',
            margin: '6px 0 0 0',
          }}>
            Leave blank for no expiration
          </p>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--line-light)' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: 'var(--cobalt)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--cobalt)';
          }}
        >
          {loading ? 'Saving...' : 'Save Link'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: 'transparent',
            color: 'var(--ink-lighter)',
            border: '1px solid var(--line-light)',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--line)';
            e.currentTarget.style.color = 'var(--ink)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--line-light)';
            e.currentTarget.style.color = 'var(--ink-lighter)';
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
