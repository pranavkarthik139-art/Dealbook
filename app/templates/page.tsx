'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TemplateForm } from '@/components/templates/TemplateForm';

interface Template {
  id: number;
  name: string;
  dealType: string;
  usage: number;
  expectedDuration?: number | null;
  estimatedValue?: number | null;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
      } else {
        setError('Failed to load templates');
      }
    } catch (err) {
      setError('Error loading templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: any) => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setTemplates([data.template, ...templates]);
        setShowCreateForm(false);
        // Show success notification
        console.log('✅ Template created:', data.template.name);
      } else {
        setError('Failed to create template');
      }
    } catch (err) {
      setError('Error creating template');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    const template = templates.find((t) => t.id === id);
    if (template) {
      setEditingId(id);
      setEditingData(template);
      setShowCreateForm(false);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editingId) return;

    try {
      setFormLoading(true);
      const response = await fetch(`/api/templates/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(
          templates.map((t) => (t.id === editingId ? data.template : t))
        );
        setEditingId(null);
        setEditingData(null);
        console.log('✅ Template updated:', data.template.name);
      } else {
        setError('Failed to update template');
      }
    } catch (err) {
      setError('Error updating template');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(templates.filter((t) => t.id !== id));
        console.log('✅ Template deleted');
      } else {
        setError('Failed to delete template');
      }
    } catch (err) {
      setError('Error deleting template');
      console.error(err);
    }
  };

  const handleApply = (id: number) => {
    // Navigate to deal creation with template ID
    // This will be implemented when we add the deal creation modal
    console.log('Apply template:', id);
    alert('Apply template feature coming soon - will create deal with this template');
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/deals"
          style={{
            color: 'var(--cobalt)',
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '16px',
            display: 'block',
          }}
        >
          ← Back to Deals
        </Link>
        <h1
          style={{
            fontSize: '32px',
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: 0,
            marginBottom: '8px',
          }}
        >
          Deal Templates
        </h1>
        <p style={{ color: 'var(--ink-lighter)', margin: 0 }}>
          Create reusable deal workflows. Define once, apply to many deals.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#991B1B',
            marginBottom: '24px',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {/* Form Section */}
      {(showCreateForm || editingId) && (
        <div
          style={{
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 20px 0',
            }}
          >
            {editingId ? 'Edit Template' : 'Create New Template'}
          </h2>
          <TemplateForm
            initialData={editingData}
            onSubmit={editingId ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingId(null);
              setEditingData(null);
            }}
            isLoading={formLoading}
          />
        </div>
      )}

      {/* Create Button */}
      {!showCreateForm && !editingId && (
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--cobalt)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '32px',
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          + Create Template
        </button>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-lighter)' }}>
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 40px',
            backgroundColor: 'var(--paper-alt)',
            borderRadius: '12px',
            border: '1px dashed var(--line)',
          }}
        >
          <p
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--ink-lighter)',
              margin: '0 0 8px 0',
            }}
          >
            No templates yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--ink-lighter)', margin: 0 }}>
            Create your first template to streamline deal creation
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              id={template.id}
              name={template.name}
              dealType={template.dealType}
              usage={template.usage}
              expectedDuration={template.expectedDuration}
              estimatedValue={template.estimatedValue}
              onEdit={handleEdit}
              onApply={handleApply}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
