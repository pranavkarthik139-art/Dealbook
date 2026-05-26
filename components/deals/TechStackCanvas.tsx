'use client';

import { useState, useRef } from 'react';
import { TECH_STACK_PRODUCTS } from '@/lib/techStackProducts';

interface StackItem {
  product: string;
  status: 'current' | 'evaluating';
}

interface TechStackCanvasProps {
  idp: string | null;
  googleStack: StackItem[];
  microsoftStack: StackItem[];
  cloudProviders: StackItem[];
  otherProducts: StackItem[];
  onProductToggle: (category: 'google' | 'microsoft' | 'cloud' | 'other', product: string) => void;
  onAddCustomProduct: (category: 'google' | 'microsoft' | 'cloud' | 'other', productName: string) => void;
}

const IDP_OPTIONS = ['Okta', 'JumpCloud', 'Ping Identity', 'Auth0', 'Custom'];

const CATEGORY_COLORS = {
  google: '#4285F4',
  microsoft: '#0078D4',
  cloud: '#FF9900',
  other: '#7C3AED'
};

const CATEGORY_NAMES = {
  google: 'Google Stack',
  microsoft: 'Microsoft Stack',
  cloud: 'Cloud Providers',
  other: 'Other Products'
};

// Convert TECH_STACK_PRODUCTS object to array format
const getProductsByCategory = (category: 'google' | 'microsoft' | 'cloud' | 'other') => {
  const categoryData = TECH_STACK_PRODUCTS[category] || {};
  return Object.entries(categoryData).map(([id, name]) => ({
    id,
    name: typeof name === 'string' ? name : '',
    category
  }));
};

export function TechStackCanvas({
  idp,
  googleStack,
  microsoftStack,
  cloudProviders,
  otherProducts,
  onProductToggle,
  onAddCustomProduct
}: TechStackCanvasProps) {
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [positions, setPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const [showCustomInput, setShowCustomInput] = useState<'google' | 'microsoft' | 'cloud' | 'other' | null>(null);
  const [customProductName, setCustomProductName] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  const canvasWidth = 1000;
  const canvasHeight = 600;
  const nodeRadius = 45;
  const categorySpacing = 200;

  // Calculate default positions for categories
  const getDefaultPositions = () => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const pos: { [key: string]: { x: number; y: number } } = {
      idp: { x: centerX, y: 80 }
    };

    const categories = ['google', 'microsoft', 'cloud', 'other'] as const;
    const categoryY = [200, 350, 350, 200];
    const categoryX = [150, 350, 650, 850];

    categories.forEach((cat, idx) => {
      pos[`${cat}-label`] = { x: categoryX[idx], y: 140 };

      const stackArray =
        cat === 'google'
          ? googleStack
          : cat === 'microsoft'
            ? microsoftStack
            : cat === 'cloud'
              ? cloudProviders
              : otherProducts;

      stackArray.forEach((item, itemIdx) => {
        const offsetY = itemIdx * 70 - ((stackArray.length - 1) * 70) / 2;
        pos[`${cat}-${item.product}`] = {
          x: categoryX[idx],
          y: categoryY[idx] + offsetY
        };
      });
    });

    return pos;
  };

  if (!positions || Object.keys(positions).length === 0) {
    setPositions(getDefaultPositions());
  }

  const allStacks = [
    { cat: 'google' as const, items: googleStack },
    { cat: 'microsoft' as const, items: microsoftStack },
    { cat: 'cloud' as const, items: cloudProviders },
    { cat: 'other' as const, items: otherProducts }
  ];

  const handleNodeDrag = (nodeKey: string, e: React.MouseEvent<SVGCircleElement>) => {
    if (e.type === 'mousedown') {
      setDraggingNode(nodeKey);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingNode || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPositions(prev => ({
      ...prev,
      [draggingNode]: { x: Math.max(nodeRadius, Math.min(canvasWidth - nodeRadius, x)), y: Math.max(nodeRadius, Math.min(canvasHeight - nodeRadius, y)) }
    }));
  };

  const handleAddCustomProduct = (category: 'google' | 'microsoft' | 'cloud' | 'other') => {
    if (customProductName.trim()) {
      onAddCustomProduct(category, customProductName);
      setCustomProductName('');
      setShowCustomInput(null);
    }
  };

  const getProductColor = (status: 'current' | 'evaluating') => {
    return status === 'current' ? '#10B981' : '#F59E0B';
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Canvas */}
      <div style={{ flex: 1 }}>
        <svg
          ref={svgRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            border: '1px solid var(--theme-border)',
            borderRadius: '8px',
            backgroundColor: 'var(--theme-card-bg)',
            cursor: draggingNode ? 'grabbing' : 'grab'
          }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={() => setDraggingNode(null)}
          onMouseLeave={() => setDraggingNode(null)}
        >
          {/* Draw connections from IDP to all products */}
          {idp && positions['idp'] &&
            allStacks.flatMap(({ cat, items }) =>
              items.map(item => {
                const fromPos = positions['idp'];
                const toPos = positions[`${cat}-${item.product}`];
                if (!fromPos || !toPos) return null;

                return (
                  <line
                    key={`line-${cat}-${item.product}`}
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={CATEGORY_COLORS[cat]}
                    strokeWidth="2"
                    opacity="0.3"
                    strokeDasharray={item.status === 'evaluating' ? '5,5' : '0'}
                  />
                );
              })
            )}

          {/* IDP Node */}
          {idp && positions['idp'] && (
            <>
              <circle
                cx={positions['idp'].x}
                cy={positions['idp'].y}
                r={nodeRadius}
                fill="#EC4899"
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => handleNodeDrag('idp', e)}
              />
              <text
                x={positions['idp'].x}
                y={positions['idp'].y}
                textAnchor="middle"
                dy="0.3em"
                fill="white"
                fontSize="11"
                fontWeight="600"
              >
                {idp}
              </text>
              <text
                x={positions['idp'].x}
                y={positions['idp'].y + 20}
                textAnchor="middle"
                fill="white"
                fontSize="9"
              >
                IDP
              </text>
            </>
          )}

          {/* Category Products */}
          {allStacks.map(({ cat, items }) =>
            items.map(item => {
              const pos = positions[`${cat}-${item.product}`];
              if (!pos) return null;

              return (
                <g key={`${cat}-${item.product}`}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius}
                    fill={CATEGORY_COLORS[cat]}
                    stroke={getProductColor(item.status)}
                    strokeWidth="3"
                    opacity="0.9"
                    style={{ cursor: 'grab' }}
                    onMouseDown={(e) => handleNodeDrag(`${cat}-${item.product}`, e)}
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dy="0.3em"
                    fill="white"
                    fontSize="10"
                    fontWeight="600"
                    pointerEvents="none"
                  >
                    {item.product.substring(0, 12)}
                  </text>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius}
                    fill="none"
                    stroke={getProductColor(item.status)}
                    strokeWidth="1"
                    opacity="0.5"
                    style={{ pointerEvents: 'none' }}
                  />
                </g>
              );
            })
          )}
        </svg>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '12px',
            fontSize: '12px',
            color: 'var(--theme-text-tertiary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: '#10B981',
                border: '1px solid #10B981'
              }}
            />
            Current
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: 'transparent',
                border: '2px dashed #F59E0B'
              }}
            />
            Evaluating
          </div>
        </div>
      </div>

      {/* Right Panel - Product Selector */}
      <div
        style={{
          width: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: canvasHeight,
          overflowY: 'auto',
          paddingRight: '8px'
        }}
      >
        {allStacks.map(({ cat, items }) => (
          <div key={cat}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--theme-text-primary)',
                marginBottom: '8px',
                paddingBottom: '6px',
                borderBottom: `2px solid ${CATEGORY_COLORS[cat]}`
              }}
            >
              {CATEGORY_NAMES[cat]}
            </div>

            {/* Available Products */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
              {getProductsByCategory(cat)
                .filter(p => !items.find(item => item.product === p.name))
                .slice(0, 8)
                .map(product => (
                  <button
                    key={`${cat}-${product.id}`}
                    onClick={() => onProductToggle(cat, product.name)}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: 'var(--theme-card-bg)',
                      border: '1px solid var(--theme-border)',
                      borderRadius: '5px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: 'var(--theme-text-primary)',
                      textAlign: 'left',
                      transition: 'all 150ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = CATEGORY_COLORS[cat];
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.borderColor = CATEGORY_COLORS[cat];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)';
                      e.currentTarget.style.color = 'var(--theme-text-primary)';
                      e.currentTarget.style.borderColor = 'var(--theme-border)';
                    }}
                  >
                    + {product.name}
                  </button>
                ))}
            </div>

            {/* Selected Products */}
            {items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                {items.map(item => (
                  <div
                    key={`${cat}-${item.product}`}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: getProductColor(item.status),
                      color: 'white',
                      borderRadius: '5px',
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{item.product}</span>
                    <button
                      onClick={() => onProductToggle(cat, item.product)}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        border: 'none',
                        borderRadius: '3px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Product Input */}
            {showCustomInput === cat ? (
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  value={customProductName}
                  onChange={(e) => setCustomProductName(e.target.value)}
                  placeholder="Product name"
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '12px',
                    border: '1px solid var(--theme-border)',
                    borderRadius: '4px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCustomProduct(cat);
                    if (e.key === 'Escape') setShowCustomInput(null);
                  }}
                />
                <button
                  onClick={() => handleAddCustomProduct(cat)}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: CATEGORY_COLORS[cat],
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomInput(cat)}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'transparent',
                  border: `1px dashed ${CATEGORY_COLORS[cat]}`,
                  color: CATEGORY_COLORS[cat],
                  borderRadius: '5px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = CATEGORY_COLORS[cat];
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = CATEGORY_COLORS[cat];
                }}
              >
                + Custom Product
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
