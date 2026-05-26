'use client';

import { useEffect, useState } from 'react';
import { StackSection } from './StackSection';
import { IDPSelector } from './IDPSelector';
import { TechStackCanvas } from './TechStackCanvas';
import { TechStackArchitectureCanvas } from './TechStackArchitectureCanvas';

interface StackItem {
  product: string;
  status: 'current' | 'evaluating';
}

interface TechStackData {
  idp: string | null;
  idpStatus: 'current' | 'evaluating';
  googleStack: StackItem[];
  microsoftStack: StackItem[];
  cloudProviders: StackItem[];
  otherProducts: StackItem[];
  notes: string | null;
}

interface TechStackOverviewProps {
  dealId: number;
  onUpdate?: (data: TechStackData) => void;
}

export function TechStackOverview({ dealId, onUpdate }: TechStackOverviewProps) {
  const [techStack, setTechStack] = useState<TechStackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [canvasMode, setCanvasMode] = useState<'topology' | 'architecture'>('architecture');

  // Fetch tech stack on mount
  useEffect(() => {
    const fetchTechStack = async () => {
      try {
        const response = await fetch(`/api/deals/${dealId}/techstack`);
        const data = await response.json();

        // Transform snake_case to camelCase
        const transformed: TechStackData = {
          idp: data.idp || null,
          idpStatus: data.idp_status || 'current',
          googleStack: Array.isArray(data.google_stack) ? data.google_stack : [],
          microsoftStack: Array.isArray(data.microsoft_stack) ? data.microsoft_stack : [],
          cloudProviders: Array.isArray(data.cloud_providers) ? data.cloud_providers : [],
          otherProducts: Array.isArray(data.other_products) ? data.other_products : [],
          notes: data.notes || null
        };

        setTechStack(transformed);
        setNotes(transformed.notes || '');
      } catch (error) {
        console.error('Failed to fetch tech stack:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechStack();
  }, [dealId]);

  const handleSave = async () => {
    if (!techStack) return;

    try {
      const payload = {
        idp: techStack.idp,
        idpStatus: techStack.idpStatus,
        googleStack: techStack.googleStack,
        microsoftStack: techStack.microsoftStack,
        cloudProviders: techStack.cloudProviders,
        otherProducts: techStack.otherProducts,
        notes
      };

      const response = await fetch(`/api/deals/${dealId}/techstack`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updated = await response.json();

        // Transform response back to camelCase
        const transformed: TechStackData = {
          idp: updated.idp || null,
          idpStatus: updated.idp_status || 'current',
          googleStack: Array.isArray(updated.google_stack) ? updated.google_stack : [],
          microsoftStack: Array.isArray(updated.microsoft_stack) ? updated.microsoft_stack : [],
          cloudProviders: Array.isArray(updated.cloud_providers) ? updated.cloud_providers : [],
          otherProducts: Array.isArray(updated.other_products) ? updated.other_products : [],
          notes: updated.notes || null
        };

        setTechStack(transformed);
        setUnsavedChanges(false);
        onUpdate?.(transformed);
      }
    } catch (error) {
      console.error('Failed to save tech stack:', error);
    }
  };

  const updateStack = (category: 'google' | 'microsoft' | 'cloud' | 'other', items: StackItem[]) => {
    if (!techStack) return;

    const updated = { ...techStack, [category === 'cloud' ? 'cloudProviders' : `${category}Stack`]: items };
    setTechStack(updated);
    setUnsavedChanges(true);
  };

  const handleProductToggle = (category: 'google' | 'microsoft' | 'cloud' | 'other', productName: string) => {
    if (!techStack) return;

    const stackKey = category === 'cloud' ? 'cloudProviders' : `${category}Stack`;
    const currentStack = techStack[stackKey as keyof TechStackData] as StackItem[];

    // Check if product already exists
    const existingIndex = currentStack.findIndex(item => item.product === productName);

    let updated: StackItem[];
    if (existingIndex >= 0) {
      // Remove product
      updated = currentStack.filter((_, i) => i !== existingIndex);
    } else {
      // Add product
      updated = [...currentStack, { product: productName, status: 'current' }];
    }

    const newStack = { ...techStack, [stackKey]: updated };
    setTechStack(newStack);
    setUnsavedChanges(true);
  };

  const handleAddCustomProduct = (category: 'google' | 'microsoft' | 'cloud' | 'other', productName: string) => {
    if (!techStack) return;

    const stackKey = category === 'cloud' ? 'cloudProviders' : `${category}Stack`;
    const currentStack = techStack[stackKey as keyof TechStackData] as StackItem[];

    // Check if product already exists
    if (!currentStack.find(item => item.product === productName)) {
      const updated = [...currentStack, { product: productName, status: 'current' }];
      const newStack = { ...techStack, [stackKey]: updated };
      setTechStack(newStack);
      setUnsavedChanges(true);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', color: 'var(--theme-text-tertiary)' }}>Loading tech stack...</div>;
  }

  if (!techStack) {
    return <div style={{ padding: '20px', color: 'var(--theme-text-tertiary)' }}>Failed to load tech stack</div>;
  }

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: 'var(--theme-main-bg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--theme-border)',
        marginBottom: '24px'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--theme-text-primary)',
            margin: '0 0 12px 0'
          }}
        >
          📚 Tech Stack
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--theme-text-tertiary)', margin: 0 }}>
          Track the customer's technology infrastructure
        </p>
      </div>

      {/* IDP Section */}
      <IDPSelector
        idp={techStack.idp}
        status={techStack.idpStatus}
        onUpdate={(idp, status) => {
          setTechStack({ ...techStack, idp, idpStatus: status });
          setUnsavedChanges(true);
        }}
      />

      {/* Canvas Mode Toggle */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', marginBottom: '12px' }}>
        <button
          onClick={() => setCanvasMode('architecture')}
          style={{
            padding: '10px 16px',
            backgroundColor: canvasMode === 'architecture' ? 'var(--theme-accent)' : 'var(--theme-card-bg)',
            color: canvasMode === 'architecture' ? 'white' : 'var(--theme-text-primary)',
            border: '1px solid var(--theme-border)',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
        >
          🎨 Architecture Canvas
        </button>
        <button
          onClick={() => setCanvasMode('topology')}
          style={{
            padding: '10px 16px',
            backgroundColor: canvasMode === 'topology' ? 'var(--theme-accent)' : 'var(--theme-card-bg)',
            color: canvasMode === 'topology' ? 'white' : 'var(--theme-text-primary)',
            border: '1px solid var(--theme-border)',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
        >
          📊 Quick Selector
        </button>
      </div>

      {/* Canvas - Architecture Mode */}
      {canvasMode === 'architecture' && (
        <div style={{ marginBottom: '20px' }}>
          <TechStackArchitectureCanvas
            dealId={dealId}
            onSave={(nodes, connections) => {
              console.log('Saved architecture:', { nodes, connections });
            }}
          />
        </div>
      )}

      {/* Canvas - Topology Mode */}
      {canvasMode === 'topology' && (
        <div style={{ marginBottom: '20px' }}>
          <TechStackCanvas
            idp={techStack.idp}
            googleStack={techStack.googleStack}
            microsoftStack={techStack.microsoftStack}
            cloudProviders={techStack.cloudProviders}
            otherProducts={techStack.otherProducts}
            onProductToggle={handleProductToggle}
            onAddCustomProduct={handleAddCustomProduct}
          />
        </div>
      )}

      {/* Notes */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--theme-text-tertiary)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '8px'
          }}
        >
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setUnsavedChanges(true);
          }}
          placeholder="Add notes about their tech stack, migration plans, etc."
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--theme-border)',
            borderRadius: '7px',
            fontSize: '13px',
            fontFamily: 'inherit',
            color: 'var(--theme-text-primary)',
            boxSizing: 'border-box',
            minHeight: '80px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={!unsavedChanges}
          style={{
            padding: '10px 20px',
            backgroundColor: unsavedChanges ? 'var(--theme-accent)' : 'var(--theme-card-bg)',
            color: unsavedChanges ? 'white' : 'var(--theme-text-tertiary)',
            border: '1px solid var(--theme-border)',
            borderRadius: '7px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: unsavedChanges ? 'pointer' : 'not-allowed',
            transition: 'all 150ms ease'
          }}
        >
          {unsavedChanges ? 'Save Changes' : 'No Changes'}
        </button>
      </div>
    </div>
  );
}
