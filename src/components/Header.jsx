import React from 'react'

export default function Header({ onRefresh, isRefreshing }) {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 12l9-9 9 9" />
            <path d="M5 10v10h14V10" />
          </svg>
        </div>
        <div>
          <div className="brand-title">Trah Karyo Suwarno</div>
          <div className="brand-subtitle">Silsilah Digital</div>
        </div>
      </div>
      <div className="header-actions">
        {onRefresh && (
          <button
            className={`btn-icon ${isRefreshing ? 'refreshing' : ''}`}
            title="Refresh Data"
            onClick={onRefresh}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}
