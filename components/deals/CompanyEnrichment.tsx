'use client';

import { useState } from 'react';
import { CompanyData, ContactData } from '@/lib/apollo';

interface CompanyEnrichmentProps {
  dealName: string;
  companyData: CompanyData | null;
  contacts: ContactData[];
  loading: boolean;
  onEnrich: () => void;
  error?: string;
}

export function CompanyEnrichment({
  dealName,
  companyData,
  contacts,
  loading,
  onEnrich,
  error,
}: CompanyEnrichmentProps) {
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  // Log received data for debugging
  if (companyData) {
    console.log('📦 CompanyEnrichment received data:', {
      name: companyData.name,
      employeeCountRange: companyData.employeeCountRange,
      yearFounded: companyData.yearFounded,
      fundingStage: companyData.fundingStage,
    });
  }

  // Show placeholder if no data and not enriching
  if (!companyData && !loading) {
    return (
      <div
        style={{
          backgroundColor: '#f9f9f7',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#999', fontSize: '14px', margin: '0 0 12px 0' }}>
          {error ? error : 'Company data not available'}
        </p>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          backgroundColor: '#f9f9f7',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          color: '#999',
        }}
      >
        Loading company information...
      </div>
    );
  }

  if (!companyData) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Card - Basic Info (Always Shown) */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
        }}
      >
        {companyData.logoUrl && (
          <img
            src={companyData.logoUrl}
            alt={companyData.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '6px',
              objectFit: 'cover',
              backgroundColor: '#f3f4f6',
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px 0' }}>
            {companyData.name}
          </h3>
          <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
            {companyData.industry}
            {companyData.subIndustry && ` • ${companyData.subIndustry}`}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            {companyData.employeeCountRange && (
              <div>
                <span style={{ color: '#999' }}>Size: </span>
                <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{companyData.employeeCountRange}</span>
              </div>
            )}
            {companyData.revenueRange && (
              <div>
                <span style={{ color: '#999' }}>Revenue: </span>
                <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{companyData.revenueRange}</span>
              </div>
            )}
            {companyData.yearFounded && (
              <div>
                <span style={{ color: '#999' }}>Founded: </span>
                <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{companyData.yearFounded}</span>
              </div>
            )}
            {companyData.fundingStage && (
              <div>
                <span style={{ color: '#999' }}>Funding: </span>
                <span style={{ fontWeight: '600', color: '#0047ff' }}>{companyData.fundingStage}</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAllDetails(!showAllDetails)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            color: '#666',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {showAllDetails ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {/* Detailed Info - Only shown when expanded */}
      {showAllDetails && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Company Size */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Company Size
          </p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
            {companyData.employeeCountRange || companyData.employeeCount || 'N/A'}
          </p>
        </div>

        {/* Founded */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Founded
          </p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
            {companyData.yearFounded || 'N/A'}
          </p>
        </div>

        {/* Funding Status */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Funding Status
          </p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#0047ff', margin: 0 }}>
            {companyData.fundingStage || 'N/A'}
          </p>
        </div>

        {/* Total Funding */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Total Funding
          </p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
            {companyData.fundingAmount ? `$${(companyData.fundingAmount / 1000000).toFixed(1)}M` : 'N/A'}
          </p>
        </div>

        {/* Last Raised */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Last Raised
          </p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
            {companyData.lastRaisedDate
              ? new Date(companyData.lastRaisedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                })
              : 'N/A'}
          </p>
        </div>

        {/* Revenue */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Revenue
          </p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
            {companyData.revenueRange || 'N/A'}
          </p>
        </div>
      </div>

      {/* Location */}
      {companyData.headquarters && (
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Headquarters
          </p>
          <p style={{ fontSize: '14px', color: '#1a1a1a', margin: 0 }}>
            {companyData.headquarters.city && `${companyData.headquarters.city}, `}
            {companyData.headquarters.state && `${companyData.headquarters.state} `}
            {companyData.headquarters.country}
          </p>
        </div>
      )}

      {/* Technologies */}
      {companyData.technologies && companyData.technologies.length > 0 && (
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#999', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
            Technologies
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {companyData.technologies.slice(0, 10).map((tech, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#666',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contacts */}
      {contacts.length > 0 && (
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setShowContacts(!showContacts)}
            style={{
              width: '100%',
              padding: '16px',
              border: 'none',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1a1a1a',
            }}
          >
            Key Contacts ({contacts.length})
            <span style={{ fontSize: '12px', color: '#999' }}>{showContacts ? '▼' : '▶'}</span>
          </button>

          {showContacts && (
            <div style={{ borderTop: '1px solid #e5e7eb' }}>
              {contacts.map((contact, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 16px',
                    borderBottom: i < contacts.length - 1 ? '1px solid #f0f0f0' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 2px 0' }}>
                      {contact.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 2px 0' }}>
                      {contact.title}
                    </p>
                    {contact.email && (
                      <p style={{ fontSize: '12px', color: '#0047ff', margin: 0 }}>
                        {contact.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
      )}
    </div>
  );
}
