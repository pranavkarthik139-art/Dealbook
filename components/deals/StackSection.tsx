'use client';

import { useState } from 'react';
import { StackProductInput } from './StackProductInput';

interface StackItem {
  product: string;
  status: 'current' | 'evaluating';
}

interface StackSectionProps {
  title: string;
  items: StackItem[];
  category: 'google' | 'microsoft' | 'cloud' | 'other';
  onUpdate: (items: StackItem[]) => void;
}

export function StackSection({ title, items, category, onUpdate }: StackSectionProps) {
  const [showAddProduct, setShowAddProduct] = useState(false);

  const addProduct = (product: string, status: 'current' | 'evaluating') => {
    const updated = [...items, { product, status }];
    onUpdate(updated);
    setShowAddProduct(false);
  };

  const removeProduct = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const updateStatus = (index: number, status: 'current' | 'evaluating') => {
    const updated = [...items];
    updated[index].status = status;
    onUpdate(updated);
  };

  return (
    <div>
      {items.length === 0 ? (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--theme-card-bg)',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'var(--theme-text-tertiary)',
            fontSize: '13px',
            marginBottom: '16px'
          }}
        >
          No products added yet
        </div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderBottom: '1px solid var(--theme-border)',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--theme-text-primary)' }}>
                  {item.product}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <label
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: item.status === 'current' ? 'var(--theme-accent)' : 'var(--theme-text-tertiary)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name={`status-${index}`}
                      value="current"
                      checked={item.status === 'current'}
                      onChange={() => updateStatus(index, 'current')}
                      style={{ marginRight: '4px', cursor: 'pointer' }}
                    />
                    Current
                  </label>

                  <label
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: item.status === 'evaluating' ? 'var(--theme-accent)' : 'var(--theme-text-tertiary)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name={`status-${index}`}
                      value="evaluating"
                      checked={item.status === 'evaluating'}
                      onChange={() => updateStatus(index, 'evaluating')}
                      style={{ marginRight: '4px', cursor: 'pointer' }}
                    />
                    Evaluating
                  </label>
                </div>

                <button
                  onClick={() => removeProduct(index)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--theme-text-tertiary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    hover: { color: 'var(--rose)' },
                    transition: 'color 150ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rose)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-text-tertiary)')}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddProduct ? (
        <StackProductInput
          category={category}
          onAdd={(product, status) => addProduct(product, status)}
          onCancel={() => setShowAddProduct(false)}
        />
      ) : (
        <button
          onClick={() => setShowAddProduct(true)}
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--theme-card-bg)',
            color: 'var(--theme-accent)',
            border: '1px dashed var(--theme-accent)',
            borderRadius: '7px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-accent-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)';
          }}
        >
          + Add Product
        </button>
      )}
    </div>
  );
}
