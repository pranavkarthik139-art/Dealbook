'use client';

interface Props {
  onSaving: (saving: boolean) => void;
}

export function ProfileTab({ onSaving }: Props) {
  return (
    <div>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>
        Profile & Account
      </h2>
      <p style={{ color: '#718096', marginBottom: '24px' }}>
        Manage your personal information and account settings
      </p>
      
      <div style={{ display: 'grid', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Full Name
          </label>
          <input 
            type="text" 
            placeholder="Your name" 
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Email
          </label>
          <input 
            type="email" 
            placeholder="your@email.com" 
            disabled
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#F9F9F7',
              color: '#718096',
            }}
          />
          <p style={{ fontSize: '12px', color: '#718096', margin: '6px 0 0 0' }}>
            Contact support to change email
          </p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Avatar
          </label>
          <button style={{
            padding: '12px 16px',
            backgroundColor: '#F0F0EB',
            border: '1px solid #E5E5E0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
          }}>
            Change Avatar
          </button>
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
