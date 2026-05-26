'use client';

import { useState } from 'react';

interface LinkCardProps {
  id: number;
  title: string;
  url: string;
  description?: string;
  category: string;
  linkType: 'internal' | 'public';
  isPublic: boolean;
  publicToken?: string;
  copyCount: number;
  lastCopiedAt?: Date;
  expiresAt?: Date;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export function LinkCard({
  id,
  title,
  url,
  description,
  category,
  linkType,
  isPublic,
  publicToken,
  copyCount,
  lastCopiedAt,
  expiresAt,
  onDelete,
  onEdit,
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleCopy = async () => {
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(url);

      // Update copy count
      await fetch(`/api/links/${id}/copy`, { method: 'POST' });

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const isExpired = expiresAt && new Date() > new Date(expiresAt);

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--line-light)',
        borderRadius: '8px',
        transition: 'all 200ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--line)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--line-light)';
      }}
    >
      {/* Header: Title + Type Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: '0 0 4px 0',
          }}>
            {title}
          </h3>
          {description && (
            <p style={{
              fontSize: '12px',
              color: 'var(--ink-light)',
              margin: '0 0 8px 0',
              lineHeight: 1.4,
            }}>
              {description}
            </p>
          )}
        </div>

        <div style={{
          display: 'inline-block',
          padding: '4px 8px',
          backgroundColor: linkType === 'public' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          color: linkType === 'public' ? 'var(--cobalt)' : 'var(--ink-lighter)',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginLeft: '8px',
          whiteSpace: 'nowrap',
        }}>
          {linkType === 'public' ? '🔓 Public' : '🔒 Internal'}
        </div>
      </div>

      {/* URL Display */}
      <div style={{
        padding: '8px 12px',
        backgroundColor: 'var(--paper-alt)',
        borderRadius: '6px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }}>
        <div style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              color: 'var(--cobalt)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
            title={url}
          >
            {url.length > 50 ? url.substring(0, 47) + '...' : url}
          </a>
        </div>

        <button
          onClick={handleCopy}
          style={{
            padding: '4px 12px',
            backgroundColor: copied ? 'var(--success)' : 'var(--cobalt)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = copied ? 'var(--success)' : 'var(--cobalt)';
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Metadata: Category, Copy Count, Expires */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: 'var(--ink-lighter)',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{
            padding: '2px 6px',
            backgroundColor: 'var(--line-light)',
            borderRadius: '3px',
            fontSize: '10px',
          }}>
            {category}
          </span>
          <span>📋 Copied {copyCount} times</span>
        </div>

        {isExpired && (
          <span style={{ color: 'var(--error)', fontWeight: 600 }}>
            ⚠️ Expired
          </span>
        )}
        {expiresAt && !isExpired && (
          <span>
            Expires: {new Date(expiresAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid var(--line-light)',
      }}>
        <button
          onClick={() => onEdit(id)}
          style={{
            flex: 1,
            padding: '6px 12px',
            backgroundColor: 'transparent',
            color: 'var(--cobalt)',
            border: '1px solid var(--cobalt)',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--cobalt)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--cobalt)';
          }}
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(id)}
          style={{
            flex: 1,
            padding: '6px 12px',
            backgroundColor: 'transparent',
            color: 'var(--error)',
            border: '1px solid var(--error)',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--error)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--error)';
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
