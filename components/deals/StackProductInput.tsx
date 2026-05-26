'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  section: string;
}

interface StackProductInputProps {
  category: 'google' | 'microsoft' | 'cloud' | 'other';
  onAdd: (product: string, status: 'current' | 'evaluating') => void;
  onCancel: () => void;
}

export function StackProductInput({ category, onAdd, onCancel }: StackProductInputProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'current' | 'evaluating'>('current');
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch products on query change
  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/products?query=${encodeURIComponent(query)}&category=${category}`
        );
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300); // Debounce
    return () => clearTimeout(timer);
  }, [query, category]);

  const handleSelectProduct = (product: Product) => {
    onAdd(product.name, selectedStatus);
  };

  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: 'var(--theme-card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--theme-border)'
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
        {/* Search Input */}
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search products... (e.g., Workday, Slack)"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--theme-border)',
              borderRadius: '7px',
              fontSize: '13px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              color: 'var(--theme-text-primary)'
            }}
          />

          {/* Dropdown Results */}
          {showDropdown && products.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--theme-main-bg)',
                border: '1px solid var(--theme-border)',
                borderRadius: '7px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                marginTop: '4px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--theme-border)',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: 'var(--theme-text-primary)',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {product.name}
                </button>
              ))}
            </div>
          )}

          {loading && query && (
            <div
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                color: 'var(--theme-text-tertiary)',
                marginTop: '4px'
              }}
            >
              Searching...
            </div>
          )}

          {query && !loading && products.length === 0 && (
            <div
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                color: 'var(--theme-text-tertiary)',
                marginTop: '4px'
              }}
            >
              No products found
            </div>
          )}
        </div>

        {/* Status Radio */}
        <div style={{ display: 'flex', gap: '8px', whiteSpace: 'nowrap' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--theme-text-tertiary)',
              cursor: 'pointer'
            }}
          >
            <input
              type="radio"
              value="current"
              checked={selectedStatus === 'current'}
              onChange={() => setSelectedStatus('current')}
              style={{ marginRight: '4px', cursor: 'pointer' }}
            />
            Current
          </label>

          <label
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--theme-text-tertiary)',
              cursor: 'pointer'
            }}
          >
            <input
              type="radio"
              value="evaluating"
              checked={selectedStatus === 'evaluating'}
              onChange={() => setSelectedStatus('evaluating')}
              style={{ marginRight: '4px', cursor: 'pointer' }}
            />
            Evaluating
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--theme-main-bg)',
            color: 'var(--theme-text-primary)',
            border: '1px solid var(--theme-border)',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--theme-main-bg)')}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
