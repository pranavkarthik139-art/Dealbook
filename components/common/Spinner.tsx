export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        animation: 'spin 1s linear infinite',
        width: '24px',
        height: '24px',
        border: '2px solid var(--line)',
        borderTopColor: 'var(--cobalt)',
        borderRadius: '50%'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
