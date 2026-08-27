import React from 'react'
import { calculateAge, formatDateIndonesian } from '../utils/ageCalculator.js'

export default function MemberDetailModal({ isOpen, member, allMembers, onEdit, onDelete, onClose }) {
  if (!isOpen || !member) return null

  const ageInfo = calculateAge(member.dob, member.deathDate)
  const isAlive = member.status === 'alive'

  const father = member.fatherId ? allMembers.find((m) => m.id === member.fatherId) : null
  const mother = member.motherId ? allMembers.find((m) => m.id === member.motherId) : null
  const spouse = member.spouseId ? allMembers.find((m) => m.id === member.spouseId) : null

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${member.name}" dari pohon keluarga?`)) {
      onDelete(member.id)
      onClose()
    }
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Detail Anggota Keluarga</h3>
          <button className="btn-icon" onClick={onClose} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
            <img
              src={member.photoUrl}
              alt={member.name}
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary)'
              }}
            />
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{member.name}</h2>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4 }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: isAlive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: isAlive ? '#34d399' : '#fca5a5',
                    fontWeight: 600
                  }}
                >
                  {isAlive ? '🟢 Hidup' : '🔴 Meninggal'}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.08)',
                    color: 'var(--text-muted)'
                  }}
                >
                  {member.gender === 'male' ? '👨 Pria' : '👩 Wanita'}
                </span>
              </div>
            </div>
          </div>

          {/* Age box */}
          <div className="age-highlight-box" style={{ marginTop: 10 }}>
            <div className="age-title">Perhitungan Umur Otomatis</div>
            <div className="age-value">{ageInfo.formattedString}</div>
            {ageInfo.isBirthdayToday && (
              <div style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold', marginTop: 4 }}>
                🎂 Ulang Tahun Hari Ini!
              </div>
            )}
          </div>

          <div className="detail-list" style={{ marginTop: 8 }}>
            <div className="detail-item">
              <span className="detail-label">Tanggal Lahir</span>
              <span className="detail-val">{formatDateIndonesian(member.dob)}</span>
            </div>

            {member.status === 'deceased' && member.deathDate && (
              <div className="detail-item">
                <span className="detail-label">Tanggal Wafat</span>
                <span className="detail-val">{formatDateIndonesian(member.deathDate)}</span>
              </div>
            )}

            <div className="detail-item">
              <span className="detail-label">Peran Keluarga</span>
              <span className="detail-val">{member.role || '-'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Ayah</span>
              <span className="detail-val">{father ? father.name : '-'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Ibu</span>
              <span className="detail-val">{mother ? mother.name : '-'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Pasangan</span>
              <span className="detail-val">{spouse ? spouse.name : '-'}</span>
            </div>

            {member.notes && (
              <div className="detail-item" style={{ flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                <span className="detail-label">Catatan</span>
                <span style={{ fontSize: '0.85rem' }}>{member.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-danger" onClick={handleDelete} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Hapus
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={onClose} type="button">
              Tutup
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose()
                onEdit(member)
              }}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Ubah (Edit)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
