'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';
import { getTheme } from '@/lib/themes';

// Import tab components (we'll create these)
import { ProfileTab } from '@/components/settings/ProfileTab';
import { PersonalizationTab } from '@/components/settings/PersonalizationTab';
import { NotificationsTab } from '@/components/settings/NotificationsTab';
import { DealMetricsTab } from '@/components/settings/DealMetricsTab';
import { IntegrationsTab } from '@/components/settings/IntegrationsTab';
import { DelegationTab } from '@/components/settings/DelegationTab';
import { OrganizationTab } from '@/components/settings/OrganizationTab';
import { AdvancedTab } from '@/components/settings/AdvancedTab';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const themeConfig = getTheme(theme);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (status === 'loading') {
    return <div className="p-8">Loading settings...</div>;
  }

  const userRole = (session?.user as any)?.role || 'sales_engineer';

  // Determine which tabs to show based on role
  const tabs = [
    { id: 'profile', label: '🔑 Profile & Account', show: true },
    { id: 'personalization', label: '🎨 Personalization', show: true },
    { id: 'notifications', label: '🔔 Notifications', show: true },
    { id: 'deal-metrics', label: '📊 Deal Metrics', show: true },
    { id: 'integrations', label: '🔗 Integrations & Sync', show: true },
    { id: 'delegation', label: '👥 Delegation & Team', show: userRole !== 'sales_engineer' },
    { id: 'organization', label: '🏢 Organization', show: userRole === 'admin' },
    { id: 'advanced', label: '⚙️ Advanced', show: true },
  ].filter(tab => tab.show);

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab onSaving={setIsSaving} />;
      case 'personalization':
        return <PersonalizationTab onSaving={setIsSaving} />;
      case 'notifications':
        return <NotificationsTab onSaving={setIsSaving} />;
      case 'deal-metrics':
        return <DealMetricsTab onSaving={setIsSaving} />;
      case 'integrations':
        return <IntegrationsTab onSaving={setIsSaving} />;
      case 'delegation':
        return <DelegationTab onSaving={setIsSaving} />;
      case 'organization':
        return <OrganizationTab onSaving={setIsSaving} />;
      case 'advanced':
        return <AdvancedTab onSaving={setIsSaving} />;
      default:
        return <ProfileTab onSaving={setIsSaving} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: themeConfig.mainColor, transition: 'background-color 300ms ease' }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${themeConfig.borderColor}`, backgroundColor: themeConfig.cardColor }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 32px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: themeConfig.textColor }}>
            Settings
          </h1>
          <p style={{ margin: '0', fontSize: '14px', color: themeConfig.secondaryTextColor }}>
            Manage your account, preferences, and integrations
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px' }}>
          {/* Sidebar Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab.id ? themeConfig.accentColor : 'transparent',
                  color: activeTab === tab.id ? '#FFFFFF' : themeConfig.secondaryTextColor,
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#F0F0EB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E5E0',
            padding: '32px',
          }}>
            {isSaving && (
              <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 16px',
                backgroundColor: '#0047FF',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                zIndex: 1000,
              }}>
                Saving...
              </div>
            )}
            {renderTab()}
          </div>
        </div>
      </div>
    </div>
  );
}
