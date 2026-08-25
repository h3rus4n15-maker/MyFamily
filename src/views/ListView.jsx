import React from 'react'

export default function ListView() {
  const members = [
    { id: 1, name: 'John Doe', relation: 'Ayah' },
    { id: 2, name: 'Jane Doe', relation: 'Ibu' },
    { id: 3, name: 'Alice Doe', relation: 'Anak' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {members.map((m) => (
        <div
          key={m.id}
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 15 }}>{m.name}</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{m.relation}</div>
        </div>
      ))}
    </div>
  )
}
