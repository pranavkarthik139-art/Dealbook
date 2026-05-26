'use client';

interface Props {
  onSaving: (saving: boolean) => void;
}

export function PersonalizationTab({ onSaving }: Props) {
  return (
    <div>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>
        🎨 Personalization
      </h2>
      <p style={{ color: '#718096', marginBottom: '24px' }}>
        Customize your experience with themes, fonts, and display preferences
      </p>
      
      <div style={{ display: 'grid', gap: '32px' }}>
        {/* Theme Selection */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>Theme</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {['Paper', 'Cobalt', 'Emerald'].map(theme => (
              <button key={theme} style={{
                padding: '16px',
                backgroundColor: '#F0F0EB',
                border: '2px solid #E5E5E0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>Font</h3>
          <select style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #E5E5E0',
            borderRadius: '8px',
            fontSize: '14px',
          }}>
            <option>DM Sans (Default)</option>
            <option>Inter</option>
            <option>Poppins</option>
            <option>Outfit</option>
          </select>
        </div>

        {/* Clock Type */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>Clock Display</h3>
          <select style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #E5E5E0',
            borderRadius: '8px',
            fontSize: '14px',
          }}>
            <option>Digital (14:30 IST)</option>
            <option>Analog Clock</option>
            <option>Both</option>
            <option>Minimal (time only)</option>
          </select>
        </div>

        <button style={{
          padding: '10px 16px',
          backgroundColor: '#0047FF',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
        }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
