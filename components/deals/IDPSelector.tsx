'use client';

import { useState } from 'react';

const IDP_OPTIONS = [
  { id: 'okta', name: 'Okta' },
  { id: 'jumpcloud', name: 'JumpCloud' },
  { id: 'ping', name: 'Ping Identity' },
  { id: 'auth0', name: 'Auth0' },
  { id: 'custom', name: 'Custom/Other' },
  { id: 'none', name: 'Not Using' }
];

interface IDPSelectorProps {
  idp: string | null;
  status: 'current' | 'evaluating';
  onUpdate: (idp: string | null, status: 'current' | 'evaluating') => void;
}

export function IDPSelector({ idp, status, onUpdate }: IDPSelectorProps) {
  const [showLearnMore, setShowLearnMore] = useState(false);

  const idpName = idp && idp !== 'none' ? IDP_OPTIONS.find(o => o.id === idp)?.name : null;

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--theme-card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--theme-border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <label
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--theme-text-primary)',
            textTransform: 'uppercase'
          }}
        >
          Identity Provider
        </label>

        <select
          value={idp || ''}
          onChange={(e) => onUpdate(e.target.value || null, status)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--theme-border)',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'inherit',
            backgroundColor: 'var(--theme-main-bg)',
            color: 'var(--theme-text-primary)',
            cursor: 'pointer'
          }}
        >
          <option value="">Select IDP...</option>
          {IDP_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>

        {idpName && (
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--theme-text-tertiary)',
                cursor: 'pointer',
                display: 'flex',
                gap: '4px'
              }}
            >
              <input
                type="radio"
                checked={status === 'current'}
                onChange={() => onUpdate(idp, 'current')}
                style={{ cursor: 'pointer' }}
              />
              Current
            </label>

            <label
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--theme-text-tertiary)',
                cursor: 'pointer',
                display: 'flex',
                gap: '4px'
              }}
            >
              <input
                type="radio"
                checked={status === 'evaluating'}
                onChange={() => onUpdate(idp, 'evaluating')}
                style={{ cursor: 'pointer' }}
              />
              Evaluating
            </label>

            <button
              onClick={() => setShowLearnMore(!showLearnMore)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--theme-accent)',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 500,
                textDecoration: 'underline'
              }}
            >
              🔍 Learn More
            </button>
          </div>
        )}
      </div>

      {showLearnMore && idpName && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: 'var(--theme-main-bg)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--theme-text-tertiary)',
            borderLeft: '3px solid var(--theme-accent)'
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>
            Comparing {idpName} with alternatives...
          </p>
          <p style={{ margin: 0, fontSize: '11px' }}>
            AI-powered comparison feature coming soon. This will help you understand the differences between
            {' '}{idpName} and other identity providers they might be evaluating.
          </p>
        </div>
      )}
    </div>
  );
}
