import React, { useEffect, useRef, useState, useCallback } from 'react'
import { calculateAge } from '../utils/ageCalculator.js'

function calculateGenerations(members) {
  const memberMap = new Map(members.map((m) => [m.id, m]))
  const genMap = new Map()

  members.forEach((m) => {
    if (!m.fatherId && !m.motherId) {
      genMap.set(m.id, 0)
    }
  })

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

  members.forEach((m) => {
    if (!genMap.has(m.id)) {
      genMap.set(m.id, 0)
    }
  })

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

  const maxGen = Math.max(...Array.from(genMap.values()), 0)
  const grouped = Array.from({ length: maxGen + 1 }, () => [])

  const visited = new Set()

  members.forEach((m) => {
    if (visited.has(m.id)) return
    const spouse = m.spouseId ? memberMap.get(m.spouseId) : null
    if (spouse) {
      visited.add(m.id)
      visited.add(spouse.id)
      const g = genMap.get(m.id) || 0
      grouped[g].push({ primary: m, spouse })
    } else {
      visited.add(m.id)
      const g = genMap.get(m.id) || 0
      grouped[g].push({ primary: m, spouse: null })
    }
  })

  return grouped
}

export default function TreeView({ members, onSelectMember }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const contentRef = useRef(null)

  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [collapsedLevels, setCollapsedLevels] = useState(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialTranslate, setInitialTranslate] = useState({ x: 0, y: 0 })
  const [initialPinchDistance, setInitialPinchDistance] = useState(null)
  const [initialPinchScale, setInitialPinchScale] = useState(1)

  const minScale = 0.4
  const maxScale = 3

  const toggleLevel = (levelIndex) => {
    setCollapsedLevels((prev) => {
      const next = new Set(prev)
      if (next.has(levelIndex)) {
        next.delete(levelIndex)
      } else {
        next.add(levelIndex)
      }
      return next
    })
  }

  const isLevelVisible = (levelIndex) => {
    for (let i = 0; i < levelIndex; i++) {
      if (collapsedLevels.has(i)) return false
    }
    return true
  }

  const zoomIn = () => {
    setScale((s) => Math.min(s + 0.25, maxScale))
  }

  const zoomOut = () => {
    setScale((s) => Math.max(s - 0.25, minScale))
  }

  const resetZoom = () => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    setScale((s) => Math.max(minScale, Math.min(maxScale, s + delta)))
  }, [])

  const handleMouseDown = (e) => {
    if (e.target.closest('.member-node') || e.target.closest('.btn-icon') || e.target.closest('.level-title')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setInitialTranslate({ ...translate })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    setTranslate({ x: initialTranslate.x + dx, y: initialTranslate.y + dy })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setInitialPinchDistance(getTouchDistance(e.touches))
      setInitialPinchScale(scale)
    } else if (e.touches.length === 1 && !e.target.closest('.member-node') && !e.target.closest('.level-title')) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      setInitialTranslate({ ...translate })
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialPinchDistance) {
      const currentDistance = getTouchDistance(e.touches)
      const newScale = initialPinchScale * (currentDistance / initialPinchDistance)
      setScale(Math.max(minScale, Math.min(maxScale, newScale)))
    } else if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStart.x
      const dy = e.touches[0].clientY - dragStart.y
      setTranslate({ x: initialTranslate.x + dx, y: initialTranslate.y + dy })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setInitialPinchDistance(null)
  }

  useEffect(() => {
    const container = containerRef.current
    const svg = svgRef.current
    const content = contentRef.current
    if (!container || !svg || !content || !members || members.length === 0) return

    const drawLines = () => {
      const wrapperRect = container.getBoundingClientRect()
      svg.setAttribute('width', wrapperRect.width.toString())
      svg.setAttribute('height', wrapperRect.height.toString())
      svg.innerHTML = ''

      const allMemberIds = new Set()
      members.forEach((m) => {
        allMemberIds.add(m.id)
        if (m.spouseId) allMemberIds.add(m.spouseId)
      })

      members.forEach((m) => {
        if (!m.fatherId && !m.motherId) return

        const childEl = content.querySelector(`[data-id="${m.id}"]`)
        if (!childEl) return

        const childRect = childEl.getBoundingClientRect()
        const childX = childRect.left + childRect.width / 2 - wrapperRect.left
        const childY = childRect.top - wrapperRect.top

        let parentEl = null
        if (m.fatherId) parentEl = content.querySelector(`[data-id="${m.fatherId}"]`)
        if (!parentEl && m.motherId) parentEl = content.querySelector(`[data-id="${m.motherId}"]`)

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

      const drawnSpouses = new Set()
      members.forEach((m) => {
        if (!m.spouseId) return
        const pairKey = [m.id, m.spouseId].sort().join('-')
        if (drawnSpouses.has(pairKey)) return
        drawnSpouses.add(pairKey)

        const connectorEl = content.querySelector(`[data-spouse-connector="${m.id}"]`)
        if (!connectorEl) return

        const connectorRect = connectorEl.getBoundingClientRect()
        const leftX = connectorRect.left - wrapperRect.left
        const rightX = connectorRect.right - wrapperRect.left
        const midY = connectorRect.top + connectorRect.height / 2 - wrapperRect.top

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        const d = `M ${leftX} ${midY} L ${rightX} ${midY}`
        path.setAttribute('d', d)
        path.setAttribute('stroke', '#ec4899')
        path.setAttribute('stroke-width', '2.5')
        path.setAttribute('fill', 'none')
        path.setAttribute('opacity', '0.85')
        path.setAttribute('stroke-dasharray', 'none')
        svg.appendChild(path)
      })
    }

    const timer = setTimeout(drawLines, 100)
    window.addEventListener('resize', drawLines)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', drawLines)
    }
  }, [members, collapsedLevels, scale, translate])

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
    <div
      ref={containerRef}
      className={`tree-container ${isDragging ? 'panning' : ''}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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

      <div
        ref={contentRef}
        className="tree-content"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        {generations.map((levelMembers, genIdx) => {
          if (!isLevelVisible(genIdx)) return null

          return (
            <div className="tree-level" key={genIdx} data-gen={genIdx + 1}>
              <span
                className="level-title"
                onClick={() => toggleLevel(genIdx)}
              >
                Generasi {genIdx + 1} {collapsedLevels.has(genIdx) ? '▼' : '▶'}
              </span>
              {levelMembers.map((pair, pairIdx) => {
                const member = pair.primary
                const spouse = pair.spouse
                const ageInfo = calculateAge(member.dob, member.deathDate)
                const isAlive = member.status === 'alive'
                return (
                  <React.Fragment key={member.id}>
                    <div
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
                    {spouse && (
                      <>
                        <div className="spouse-connector" data-spouse-connector={member.id} />
                        <div
                          className="member-node"
                          data-id={spouse.id}
                          onClick={() => onSelectMember(spouse)}
                        >
                          <div className="avatar-wrapper">
                            <img src={spouse.photoUrl} alt={spouse.name} className="avatar-img" />
                            <span
                              className={`status-dot ${spouse.status === 'alive' ? 'alive' : 'deceased'}`}
                              title={spouse.status === 'alive' ? 'Hidup' : 'Meninggal'}
                            />
                          </div>
                          <div className="member-name">{spouse.name}</div>
                          <div className="member-age-badge">
                            {calculateAge(spouse.dob, spouse.deathDate).shortString}
                          </div>
                          <div className="member-role">
                            {spouse.role || (spouse.gender === 'male' ? 'Pria' : 'Wanita')}
                          </div>
                        </div>
                      </>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="tree-controls">
        <button type="button" className="tree-btn" onClick={zoomIn} title="Perbesar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button type="button" className="tree-btn" onClick={resetZoom} title="Reset Zoom">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
          </svg>
        </button>
        <button type="button" className="tree-btn" onClick={zoomOut} title="Perkecil">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  )
}
