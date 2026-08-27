import React from 'react'
import { calculateAge } from '../utils/ageCalculator.js'

export default function StatsView({ members }) {
  const list = members || []
  const total = list.length
  const aliveCount = list.filter((m) => m.status === 'alive').length
  const deceasedCount = total - aliveCount
  const maleCount = list.filter((m) => m.gender === 'male').length
  const femaleCount = list.filter((m) => m.gender === 'female').length

  let totalAge = 0
  let validAgeCount = 0
  list.forEach((m) => {
    const ageObj = calculateAge(m.dob, m.deathDate)
    if (ageObj.years >= 0) {
      totalAge += ageObj.years
      validAgeCount++
    }
  })
  const avgAge = validAgeCount > 0 ? Math.round(totalAge / validAgeCount) : 0

  return (
    <div className="stats-container">
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>
        Ringkasan Silsilah Keluarga
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
        Statistik demografi & usia seluruh anggota yang terdaftar.
      </p>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-number">{total}</div>
          <div className="stat-label">Total Anggota</div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-number">
            {avgAge} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>Thn</span>
          </div>
          <div className="stat-label">Rata-rata Usia</div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="stat-number">{aliveCount}</div>
          <div className="stat-label">Status Hidup (🟢)</div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <div className="stat-number">{deceasedCount}</div>
          <div className="stat-label">Telah Wafat (🔴)</div>
        </div>
      </div>

      <div className="stat-box" style={{ marginTop: 10 }}>
        <div className="stat-label" style={{ marginBottom: 8, fontWeight: 600 }}>
          Gender Breakdown
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <span>👨 Pria: <strong>{maleCount}</strong></span>
          <span>👩 Wanita: <strong>{femaleCount}</strong></span>
        </div>
        <div
          style={{
            height: 8,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            marginTop: 8
          }}
        >
          <div style={{ width: `${total > 0 ? (maleCount / total) * 100 : 0}%`, background: '#3b82f6' }} />
          <div style={{ width: `${total > 0 ? (femaleCount / total) * 100 : 0}%`, background: '#ec4899' }} />
        </div>
      </div>
    </div>
  )
}
