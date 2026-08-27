import React, { useEffect, useRef } from 'react'
import { calculateAge } from '../utils/ageCalculator.js'

function calculateGenerations(members) {
  const genMap = new Map()

  // Find roots (members with no parents in database)
  members.forEach((m) => {
    if (!m.fatherId && !m.motherId) {
      genMap.set(m.id, 0)
    }
  })

  // Iteratively resolve generations for children
  let changed = true
  let passes = 0
  while (changed && passes < 10) {
    changed = false
    passes++
    members.forEach((m) => {
      const fatherGen = m.fatherId ? genMap.get(m.fatherId) : undefined
      const motherGen = m.motherId ? genMap.get(m.motherId) : undefined

      const maxParentGen = Math.max(
        fatherGen !== undefined ? fatherGen : -1,
        motherGen !== undefined ? motherGen : -1
      )

      if (maxParentGen >= 0) {
        const currentGen = genMap.get(m.id)
        const newGen = maxParentGen + 1
        if (currentGen !== newGen) {
          genMap.set(m.id, newGen)
          changed = true
        }
      }
    })
  }

  // Assign default 0 for unassigned
  members.forEach((m) => {
    if (!genMap.has(m.id)) {
      genMap.set(m.id, 0)
    }
  })

  // Sync spouses to same generation
  for (let i = 0; i < 3; i++) {
    members.forEach((m) => {
      if (m.spouseId && genMap.has(m.spouseId)) {
        const myGen = genMap.get(m.id)
        const spouseGen = genMap.get(m.spouseId)
        const targetGen = Math.max(myGen, spouseGen)
        genMap.set(m.id, targetGen)
        genMap.set(m.spouseId, targetGen)
      }
    })
  }

  // Group into arrays
  const maxGen = Math.max(...Array.from(genMap.values()), 0)
  const result = Array.from({ length: maxGen + 1 }, () => [])

  members.forEach((m) => {
    const g = genMap.get(m.id) || 0
    result[g].push(m)
  })

  return result
}

export default function TreeView({ members, onSelectMember }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    const wrapper = containerRef.current
    const svg = svgRef.current
    if (!wrapper || !svg || !members || members.length === 0) return

    const drawLines = () => {
      const wrapperRect = wrapper.getBoundingClientRect()
      svg.setAttribute('width', wrapperRect.width.toString())
      svg.setAttribute('height', wrapperRect.height.toString())
      svg.innerHTML = ''

      members.forEach((m) => {
        if (!m.fatherId && !m.motherId) return

        const childEl = wrapper.querySelector(`[data-id="${m.id}"]`)
        if (!childEl) return

        const childRect = childEl.getBoundingClientRect()
        const childX = childRect.left + childRect.width / 2 - wrapperRect.left
        const childY = childRect.top - wrapperRect.top

        let parentEl = null
        if (m.fatherId) parentEl = wrapper.querySelector(`[data-id="${m.fatherId}"]`)
        if (!parentEl && m.motherId) parentEl = wrapper.querySelector(`[data-id="${m.motherId}"]`)

        if (parentEl) {
          const parentRect = parentEl.getBoundingClientRect()
          const parentX = parentRect.left + parentRect.width / 2 - wrapperRect.left
          const parentY = parentRect.bottom - wrapperRect.top

          const midY = parentY + (childY - parentY) / 2

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          const d = `M ${parentX} ${parentY} V ${midY} H ${childX} V ${childY}`
          path.setAttribute('d', d)
          path.setAttribute('stroke', '#6366f1')
          path.setAttribute('stroke-width', '2')
          path.setAttribute('fill', 'none')
          path.setAttribute('opacity', '0.6')
          path.setAttribute('stroke-dasharray', '4 2')
          svg.appendChild(path)
        }
      })
    }

    const timer = setTimeout(drawLines, 100)
    window.addEventListener('resize', drawLines)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', drawLines)
    }
  }, [members])

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

  const generations = calculateGenerations(members)

  return (
    <div className="tree-container" ref={containerRef}>
      <svg
        ref={svgRef}
        id="tree-svg-lines"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {generations.map((levelMembers, genIdx) => (
        <div className="tree-level" key={genIdx} data-gen={genIdx + 1}>
          <span className="level-title">Generasi {genIdx + 1}</span>
          {levelMembers.map((member) => {
            const ageInfo = calculateAge(member.dob, member.deathDate)
            const isAlive = member.status === 'alive'
            return (
              <div
                key={member.id}
                className="member-node"
                data-id={member.id}
                onClick={() => onSelectMember(member)}
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
          })}
        </div>
      ))}
    </div>
  )
}
