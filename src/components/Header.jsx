import React from 'react'

export default function Header() {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div>
          <div className="brand-title">Pohon Keluarga</div>
          <div className="brand-subtitle">Silsilah Digital Android</div>
        </div>
      </div>
    </header>
  )
}
