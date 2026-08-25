import React from 'react'

export default function TreeView() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 16px', color: '#6b7280' }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.5 }}>
        <rect x="9" y="3" width="6" height="6" rx="1" />
        <rect x="3" y="15" width="6" height="6" rx="1" />
        <rect x="15" y="15" width="6" height="6" rx="1" />
        <path d="M12 9v3M6 15v-3h12v3" />
      </svg>
      <p>Visual Tree akan ditampilkan di sini.</p>
    </div>
  )
}
