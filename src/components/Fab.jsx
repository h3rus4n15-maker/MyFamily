import React from 'react'

export default function Fab({ onClick }) {
  return (
    <button className="fab-add" title="Tambah Anggota Keluarga" onClick={onClick}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  )
}
