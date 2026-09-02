import React, { useState, useEffect } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { ensureDemoMode, ensureProMode } from '../storage/storageAdapter.js'

const FAMILY_PIN = 'trahkaryosuwarno' // ganti sesuai keinginan Anda
const STORAGE_KEY = 'pohonkeluarga_verified'

export default function PinGate({ children }) {
  const [isVerified, setIsVerified] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [pinInput, setPinInput] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const alreadyVerified = localStorage.getItem(STORAGE_KEY) === 'true'
      if (user && !user.isAnonymous) {
        ensureProMode()
      } else {
        ensureDemoMode()
      }

      if (user && alreadyVerified) {
        setIsVerified(true)
      }
      setIsCheckingAuth(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (pinInput.trim() !== FAMILY_PIN) {
      setError('Kode salah. Coba lagi ya.')
      return
    }

    setIsSubmitting(true)
    try {
      await signInAnonymously(auth)
      localStorage.setItem(STORAGE_KEY, 'true')
      setIsVerified(true)
    } catch (err) {
      console.error('Gagal masuk:', err)
      setError('Gagal masuk, coba lagi beberapa saat.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingAuth) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat...</div>
  }

  if (isVerified) {
    return children
  }

  return (
    <div className="pin-gate-overlay">
      <form onSubmit={handleSubmit} className="pin-gate-card">
        <h2>🌳 Pohon Keluarga</h2>
        <p>Masukkan kode keluarga untuk melanjutkan</p>
        <input
          type="password"
          className="form-control"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          placeholder="Kode keluarga"
          autoFocus
        />
        {error && <p className="pin-gate-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}