'use client';

interface Props {
  onSaving: (saving: boolean) => void;
}

export function AdvancedTab({ onSaving }: Props) {
  return (
    <div>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>
        AdvancedTab
      </h2>
      <p style={{ color: '#718096', marginBottom: '24px' }}>
        Configure your AdvancedTab settings
      </p>
      
      <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#F9F9F7', borderRadius: '8px' }}>
        <p style={{ color: '#718096', margin: '0' }}>
          AdvancedTab content coming soon...
        </p>
      </div>
    </div>
  );
}
