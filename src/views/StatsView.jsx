import React from 'react'

export default function StatsView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[
        { label: 'Total Anggota', value: '3' },
        { label: 'Generasi', value: '2' },
        { label: 'Rata-rata Usia', value: '35 th' },
      ].map((s) => (
        <div
          key={s.label}
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#6b7280', fontSize: 14 }}>{s.label}</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#4f46e5' }}>{s.value}</span>
        </div>
      ))}
    </div>
  )
}
