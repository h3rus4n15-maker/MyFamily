import React, { useState } from 'react'
import { calculateAge, formatDateIndonesian } from '../utils/ageCalculator.js'

export default function ListView({ members, onSelectMember }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredMembers = (members || []).filter((m) => {
    const term = searchTerm.toLowerCase()
    const matchSearch =
      m.name.toLowerCase().includes(term) || (m.role && m.role.toLowerCase().includes(term))
    const matchStatus = statusFilter === 'all' || m.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Cari nama atau peran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="alive">🟢 Hidup</option>
          <option value="deceased">🔴 Meninggal</option>
        </select>
      </div>

      {/* Grid Container */}
      <div className="members-grid">
        {filteredMembers.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>Anggota keluarga tidak ditemukan.</p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const ageInfo = calculateAge(member.dob, member.deathDate)
            const isAlive = member.status === 'alive'
            return (
              <div
                key={member.id}
                className="member-card-item"
                onClick={() => onSelectMember(member)}
              >
                <div className="avatar-wrapper">
                  <img src={member.photoUrl} alt={member.name} className="avatar-img" />
                  <span className={`status-dot ${isAlive ? 'alive' : 'deceased'}`} />
                </div>
                <div className="card-info">
                  <div className="card-name">{member.name}</div>
                  <div className="card-details">
                    <span>
                      📅 {formatDateIndonesian(member.dob)} ({ageInfo.formattedString})
                    </span>
                    <span>🏷️ {member.role || 'Anggota Keluarga'}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-icon" title="Lihat Detail" type="button">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
