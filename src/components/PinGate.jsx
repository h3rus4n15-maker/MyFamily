import React, { useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../firebase'
import { ensureDemoMode, ensureProMode } from '../storage/storageAdapter.js'

const FAMILY_PIN = 'myfamily' // ganti sesuai keinginan Anda
const STORAGE_KEY = 'myfamily_verified'

export default function PinGate({ children }) {
  const [isVerified, setIsVerified] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [pinInput, setPinInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [accessMode, setAccessMode] = useState('demo')
  const [isRegistering, setIsRegistering] = useState(false)
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

    setIsSubmitting(true)
    try {
      if (accessMode === 'demo') {
        if (pinInput.trim() !== FAMILY_PIN) {
          setError('Kode salah. Coba lagi ya.')
          return
        }
        await signInAnonymously(auth)
      } else if (isRegistering) {
        await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput)
      } else {
        await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput)
      }

      localStorage.setItem(STORAGE_KEY, 'true')
      setIsVerified(true)
    } catch (err) {
      console.error('Gagal masuk:', err)
      setError(accessMode === 'demo'
        ? 'Gagal masuk, coba lagi beberapa saat.'
        : 'Email atau password tidak valid. Pastikan Email/Password sudah diaktifkan di Firebase.')
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
        <div className="demo-storage-actions">
          <button type="button" className={`btn ${accessMode === 'demo' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setAccessMode('demo'); setError('') }}>
            Demo
          </button>
          <button type="button" className={`btn ${accessMode === 'pro' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setAccessMode('pro'); setError('') }}>
            Pro
          </button>
        </div>
        {accessMode === 'demo' ? (
          <>
            <p>Masukkan kode keluarga untuk melanjutkan</p>
            <input
              type="password"
              className="form-control"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Kode keluarga"
              autoFocus
            />
          </>
        ) : (
          <>
            <p>{isRegistering ? 'Buat akun Pro' : 'Masuk dengan akun Pro'}</p>
            <input
              type="email"
              className="form-control"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              autoFocus
              required
            />
            <input
              type="password"
              className="form-control"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password minimal 6 karakter"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              minLength="6"
              required
            />
            <button type="button" className="btn-link" onClick={() => { setIsRegistering(!isRegistering); setError('') }}>
              {isRegistering ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
            </button>
          </>
        )}
        {error && <p className="pin-gate-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Memeriksa...' : accessMode === 'pro' && isRegistering ? 'Daftar Pro' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}