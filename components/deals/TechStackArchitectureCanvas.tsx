'use client';

import { useState, useRef, useEffect } from 'react';

interface CanvasNode {
  id: string;
  type: 'product' | 'database' | 'api' | 'service' | 'text';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  status?: 'current' | 'evaluating';
}

interface CanvasConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

interface TechStackArchitectureCanvasProps {
  dealId: number;
  onSave?: (nodes: CanvasNode[], connections: CanvasConnection[]) => void;
}

const SHAPE_COLORS = {
  product: '#4285F4',
  database: '#FF6B6B',
  api: '#51CF66',
  service: '#FFD93D',
  text: '#95E1D3'
};

const TOOLBAR_TOOLS = [
  { id: 'product', label: '📦 Product', icon: '📦' },
  { id: 'database', label: '🗄️ Database', icon: '🗄️' },
  { id: 'api', label: '🔌 API', icon: '🔌' },
  { id: 'service', label: '⚙️ Service', icon: '⚙️' },
  { id: 'text', label: '📝 Text', icon: '📝' },
  { id: 'connection', label: '➜ Connect', icon: '➜' },
  { id: 'export', label: '💾 Export', icon: '💾' }
];

export function TechStackArchitectureCanvas({
  dealId,
  onSave
}: TechStackArchitectureCanvasProps) {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const canvasWidth = 1200;
  const canvasHeight = 700;

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedTool || selectedTool === 'connection' || selectedTool === 'export') return;

    const svg = canvasRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (selectedTool === 'text') {
      const label = prompt('Enter text:');
      if (!label) return;

      const newNode: CanvasNode = {
        id: `text-${Date.now()}`,
        type: 'text',
        label,
        x,
        y,
        width: 120,
        height: 40,
        color: SHAPE_COLORS.text
      };
      setNodes([...nodes, newNode]);
    } else {
      const newNode: CanvasNode = {
        id: `${selectedTool}-${Date.now()}`,
        type: selectedTool as any,
        label: selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1),
        x,
        y,
        width: 100,
        height: 60,
        color: SHAPE_COLORS[selectedTool as keyof typeof SHAPE_COLORS],
        status: 'current'
      };
      setNodes([...nodes, newNode]);
    }
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent<SVGGElement>) => {
    e.stopPropagation();

    if (selectedTool === 'connection') {
      if (connectingFrom === nodeId) {
        setConnectingFrom(null);
      } else if (connectingFrom) {
        const newConnection: CanvasConnection = {
          id: `conn-${Date.now()}`,
          fromNodeId: connectingFrom,
          toNodeId: nodeId,
          style: 'solid'
        };
        setConnections([...connections, newConnection]);
        setConnectingFrom(null);
      } else {
        setConnectingFrom(nodeId);
      }
    } else {
      setDraggingNode(nodeId);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingNode || !canvasRef.current) return;

    const svg = canvasRef.current;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    setNodes(nodes.map(node =>
      node.id === draggingNode
        ? { ...node, x: Math.max(0, Math.min(canvasWidth - node.width, x - node.width / 2)), y: Math.max(0, Math.min(canvasHeight - node.height, y - node.height / 2)) }
        : node
    ));
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
  };

  const handleExport = () => {
    if (!canvasRef.current) return;

    const svg = canvasRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `tech-stack-${dealId}-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);

    // Also save to backend
    onSave?.(nodes, connections);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => direction === 'in' ? Math.min(prev + 0.2, 3) : Math.max(prev - 0.2, 0.5));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px',
          backgroundColor: 'var(--theme-card-bg)',
          borderRadius: '8px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        {TOOLBAR_TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => {
              if (tool.id === 'export') {
                handleExport();
              } else {
                setSelectedTool(selectedTool === tool.id ? null : tool.id);
              }
            }}
            title={tool.label}
            style={{
              padding: '8px 12px',
              backgroundColor: selectedTool === tool.id ? 'var(--theme-accent)' : 'var(--theme-main-bg)',
              color: selectedTool === tool.id ? 'white' : 'var(--theme-text-primary)',
              border: '1px solid var(--theme-border)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 150ms ease'
            }}
            onMouseEnter={(e) => {
              if (selectedTool !== tool.id) {
                e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTool !== tool.id) {
                e.currentTarget.style.backgroundColor = 'var(--theme-main-bg)';
              }
            }}
          >
            {tool.icon}
          </button>
        ))}

        {/* Zoom Controls */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button
            onClick={() => handleZoom('out')}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--theme-main-bg)',
              border: '1px solid var(--theme-border)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            −
          </button>
          <span style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--theme-text-tertiary)' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom('in')}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--theme-main-bg)',
              border: '1px solid var(--theme-border)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative', border: '1px solid var(--theme-border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
        <svg
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            cursor: selectedTool === 'connection' && connectingFrom ? 'crosshair' : 'default',
            transform: `scale(${zoom}) translateX(${pan.x}px) translateY(${pan.y}px)`,
            transformOrigin: '0 0',
            background: 'linear-gradient(90deg, #f9f9f7 1px, transparent 1px), linear-gradient(#f9f9f7 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={() => setDraggingNode(null)}
          onMouseLeave={() => setDraggingNode(null)}
        >
          {/* Draw connections */}
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.fromNodeId);
            const toNode = nodes.find(n => n.id === conn.toNodeId);
            if (!fromNode || !toNode) return null;

            return (
              <g key={conn.id}>
                <line
                  x1={fromNode.x + fromNode.width / 2}
                  y1={fromNode.y + fromNode.height / 2}
                  x2={toNode.x + toNode.width / 2}
                  y2={toNode.y + toNode.height / 2}
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeDasharray={conn.style === 'dashed' ? '5,5' : '0'}
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}

          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#6366F1" />
            </marker>
          </defs>

          {/* Draw nodes */}
          {nodes.map(node => (
            <g
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              style={{ cursor: draggingNode === node.id ? 'grabbing' : 'grab' }}
            >
              {node.type === 'text' ? (
                <text
                  x={node.x}
                  y={node.y + 20}
                  fontSize="12"
                  fill="var(--theme-text-primary)"
                  pointerEvents="none"
                  fontWeight="500"
                >
                  {node.label}
                </text>
              ) : (
                <>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    fill={node.color}
                    stroke={node.status === 'evaluating' ? '#F59E0B' : '#10B981'}
                    strokeWidth={node.status === 'evaluating' ? '3' : '2'}
                    rx="6"
                    opacity="0.85"
                  />
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fill="white"
                    fontWeight="600"
                    pointerEvents="none"
                  >
                    {node.label.substring(0, 12)}
                  </text>
                  {/* Delete button on hover */}
                  <circle
                    cx={node.x + node.width - 8}
                    cy={node.y + 8}
                    r="6"
                    fill="#FF6B6B"
                    opacity="0"
                    style={{ transition: 'opacity 150ms ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    onClick={() => handleDeleteNode(node.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <text
                    x={node.x + node.width - 8}
                    y={node.y + 8 + 2}
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                    opacity="0"
                    style={{ transition: 'opacity 150ms ease', pointerEvents: 'none' }}
                    onMouseEnter={(e) => (e.parentElement!.style.opacity = '1')}
                  >
                    ✕
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Instructions */}
      <div style={{ fontSize: '12px', color: 'var(--theme-text-tertiary)', padding: '8px 12px', backgroundColor: 'var(--theme-card-bg)', borderRadius: '6px' }}>
        {selectedTool === 'connection'
          ? connectingFrom
            ? '👉 Click a node to connect to'
            : '👉 Click a node to start connecting'
          : selectedTool
            ? `👉 Click on canvas to add ${selectedTool}`
            : '👈 Select a tool from toolbar'}
      </div>

      {/* Stats */}
      <div style={{ fontSize: '12px', color: 'var(--theme-text-tertiary)', display: 'flex', gap: '16px' }}>
        <span>📦 Nodes: {nodes.length}</span>
        <span>➜ Connections: {connections.length}</span>
        <span>🎯 Status: {nodes.filter(n => n.status === 'evaluating').length} evaluating</span>
      </div>
    </div>
  );
}
