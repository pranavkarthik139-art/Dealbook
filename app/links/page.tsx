'use client';

import { useEffect, useState } from 'react';
import { LinkCard } from '@/components/links/LinkCard';
import { LinkForm } from '@/components/links/LinkForm';

interface Link {
  id: number;
  title: string;
  url: string;
  description?: string;
  category: string;
  linkType: 'internal' | 'public';
  isPublic: boolean;
  publicToken?: string;
  copyCount: number;
  lastCopiedAt?: string;
  expiresAt?: string;
}

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'internal' | 'public'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['general', 'sales', 'technical', 'legal', 'financial', 'other'];

  // Fetch links
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter links
  const filteredLinks = links.filter(link => {
    const matchesSearch = searchTerm === '' ||
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || link.linkType === selectedType;
    const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Handle create/update
  const handleSubmit = async (data: any) => {
    try {
      const url = editingId ? `/api/links/${editingId}` : '/api/links';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingId(null);
        await fetchLinks();
      }
    } catch (error) {
      console.error('Error saving link:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this link?')) return;

    try {
      const response = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchLinks();
      }
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  // Handle edit
  const handleEdit = (id: number) => {
    const link = links.find(l => l.id === id);
    if (link) {
      setEditingId(id);
      setShowForm(true);
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      padding: '40px',
      backgroundColor: 'var(--paper)',
      color: 'var(--ink)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              fontFamily: '"Playfair Display", serif',
              color: 'var(--ink)',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px',
            }}>
              📎 Link Hub
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--ink-light)',
              margin: 0,
            }}>
              Centralized storage for all your internal and public-facing links
            </p>
          </div>

          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--cobalt)',
              color: 'white',
              border: 'none',
              borderRadius: '7px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cobalt)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            + New Link
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'var(--paper)',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: '0 0 24px 0',
              }}>
                {editingId ? 'Edit Link' : 'Add New Link'}
              </h2>

              <LinkForm
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                initialData={editingId ? links.find(l => l.id === editingId) : undefined}
                categories={categories}
              />
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              border: '1px solid var(--line-light)',
              borderRadius: '8px',
              backgroundColor: 'var(--paper-alt)',
              color: 'var(--ink)',
              boxSizing: 'border-box',
            }}
          />

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              border: '1px solid var(--line-light)',
              borderRadius: '8px',
              backgroundColor: 'var(--paper-alt)',
              color: 'var(--ink)',
              boxSizing: 'border-box',
            }}
          >
            <option value="all">All Types</option>
            <option value="internal">🔒 Internal Only</option>
            <option value="public">🔓 Public Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              border: '1px solid var(--line-light)',
              borderRadius: '8px',
              backgroundColor: 'var(--paper-alt)',
              color: 'var(--ink)',
              boxSizing: 'border-box',
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Links Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--ink-light)' }}>Loading links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            backgroundColor: 'var(--paper-alt)',
            borderRadius: '12px',
            border: '1px solid var(--line-light)',
          }}>
            <p style={{
              fontSize: '16px',
              color: 'var(--ink-light)',
              margin: '0 0 12px 0',
            }}>
              {links.length === 0 ? 'No links yet' : 'No links match your filters'}
            </p>
            {links.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--cobalt)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--cobalt-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--cobalt)';
                }}
              >
                Create your first link
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            {filteredLinks.map(link => (
              <LinkCard
                key={link.id}
                {...link}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && filteredLinks.length > 0 && (
          <div style={{
            marginTop: '40px',
            padding: '20px',
            backgroundColor: 'var(--paper-alt)',
            borderRadius: '8px',
            border: '1px solid var(--line-light)',
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--ink-light)',
          }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
                {filteredLinks.length}
              </div>
              <div>Links</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
                {filteredLinks.filter(l => l.isPublic).length}
              </div>
              <div>Public</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
                {filteredLinks.reduce((sum, l) => sum + l.copyCount, 0)}
              </div>
              <div>Total Copies</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
