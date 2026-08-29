import React, { useState, useMemo, useEffect } from 'react'
import { calculateAge } from '../utils/ageCalculator.js'

const FOCUS_STORAGE_KEY = 'pohonkeluarga_focus_id'

function getRootCandidate(members) {
  const root = members.find((m) => !m.fatherId && !m.motherId)
  return root ? root.id : members[0] ? members[0].id : null
}

function MemberCard({ member, onClick, size = 'normal', highlight = false }) {
  if (!member) return null
  const ageInfo = calculateAge(member.dob, member.deathDate)
  const isAlive = member.status === 'alive'
  return (
    <div
      className={`member-node focus-node-${size} ${highlight ? 'focus-node-highlight' : ''}`}
      onClick={() => onClick(member)}
    >
      <div className="avatar-wrapper">
        <img src={member.photoUrl} alt={member.name} className="avatar-img" />
        <span
          className={`status-dot ${isAlive ? 'alive' : 'deceased'}`}
          title={isAlive ? 'Hidup' : 'Meninggal'}
        />
      </div>
      <div className="member-name">{member.name}</div>
      <div className="member-age-badge">{ageInfo.shortString}</div>
      <div className="member-role">
        {member.role || (member.gender === 'male' ? 'Pria' : 'Wanita')}
      </div>
    </div>
  )
}

export default function TreeView({ members, onSelectMember }) {
  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])

  const [focusedId, setFocusedId] = useState(() => {
    const saved = localStorage.getItem(FOCUS_STORAGE_KEY)
    if (saved && members.some((m) => m.id === saved)) return saved
    return getRootCandidate(members)
  })
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (focusedId && !memberMap.has(focusedId)) {
      setFocusedId(getRootCandidate(members))
      setHistory([])
    }
  }, [members, focusedId, memberMap])

  useEffect(() => {
    if (focusedId) localStorage.setItem(FOCUS_STORAGE_KEY, focusedId)
  }, [focusedId])

  if (!members || members.length === 0) {
    return (
      <div className="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <p>Belum ada anggota keluarga. Klik tombol + untuk menambahkan anggota pertama.</p>
      </div>
    )
  }

  const focused = memberMap.get(focusedId) || members[0]
  const father = focused.fatherId ? memberMap.get(focused.fatherId) : null
  const mother = focused.motherId ? memberMap.get(focused.motherId) : null
  const spouse = focused.spouseId ? memberMap.get(focused.spouseId) : null

  const children = members.filter((m) => {
    if (m.fatherId === focused.id || m.motherId === focused.id) return true
    if (spouse && (m.fatherId === spouse.id || m.motherId === spouse.id)) return true
    return false
  })

  const handleRefocus = (member) => {
    if (member.id === focused.id) return
    setHistory((prev) => [...prev, focused.id])
    setFocusedId(member.id)
  }

  const handleBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const next = [...prev]
      const last = next.pop()
      setFocusedId(last)
      return next
    })
  }

  const hasParents = Boolean(father || mother)
  const hasChildren = children.length > 0

  return (
    <div className="tree-container tree-focused">
      {history.length > 0 && (
        <button type="button" className="tree-back-btn" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Kembali
        </button>
      )}

      {hasParents && (
        <>
          <div className="focus-row focus-row-parents">
            <MemberCard member={father} onClick={handleRefocus} size="small" />
            <MemberCard member={mother} onClick={handleRefocus} size="small" />
          </div>
          <div className="focus-connector" />
        </>
      )}

      <div className="focus-row focus-row-center">
        <MemberCard
          member={focused}
          onClick={() => onSelectMember(focused)}
          size="large"
          highlight
        />
        {spouse && (
          <>
            <div className="focus-connector-spouse" />
            <MemberCard member={spouse} onClick={handleRefocus} size="large" />
          </>
        )}
      </div>

      {hasChildren && (
        <>
          <div className="focus-connector" />
          <div className="focus-row focus-row-children">
            {children.map((child) => (
              <MemberCard key={child.id} member={child} onClick={handleRefocus} size="small" />
            ))}
          </div>
        </>
      )}

      {!hasParents && !hasChildren && !spouse && (
        <p className="focus-hint">
          {focused.name} belum punya data ortu, pasangan, atau anak yang tercatat.
        </p>
      )}
    </div>
  )
}