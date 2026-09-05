import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Fab from './components/Fab'
import TreeView from './views/TreeView'
import ListView from './views/ListView'
import StatsView from './views/StatsView'
import MemberFormModal from './components/MemberFormModal.jsx'
import MemberDetailModal from './components/MemberDetailModal.jsx'
import {
  STORAGE_MODES,
  downloadLocalBackup,
  ensureDemoMode,
  ensureProMode,
  getActiveStorageMode,
  getAdapter,
  importLocalFamilyData,
  isProUser,
  migrateLocalToCloud,
} from './storage/storageAdapter.js'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('tree')
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [storageMode, setStorageMode] = useState(getActiveStorageMode())

  const fetchMembers = async () => {
    try {
      const adapter = getAdapter(storageMode)
      const dataList = await adapter.listMembers()
      setMembers(dataList)
    } catch (error) {
      console.error('Gagal mengambil data:', error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchMembers()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        ensureProMode()
        setStorageMode(STORAGE_MODES.PRO)
      } else {
        ensureDemoMode()
        setStorageMode(STORAGE_MODES.DEMO)
      }
    })

    setStorageMode(getActiveStorageMode())
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const adapter = getAdapter(storageMode)
    const unsubscribe = adapter.subscribeMembers((dataList) => {
      setMembers(dataList)
    })

    fetchMembers()
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [storageMode])

  const handleOpenAdd = () => {
    setEditingMember(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (member) => {
    setEditingMember(member)
    setIsFormOpen(true)
  }

  const handleSelectMember = (member) => {
    setSelectedMember(member)
    setIsDetailOpen(true)
  }

  const handleSaveMember = async () => {
    await fetchMembers()
  }

  const handleDeleteMember = async (id) => {
    try {
      const adapter = getAdapter(storageMode)
      await adapter.deleteMember(id)
      await fetchMembers()
    } catch (error) {
      console.error('Gagal menghapus data:', error)
      alert('Terjadi kesalahan saat menghapus data.')
    }
  }

  const handleExportBackup = async () => {
    try {
      const json = await downloadLocalBackup()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'myfamily-backup.json'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Gagal mengekspor backup:', error)
      alert('Backup gagal dibuat.')
    }
  }

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      await importLocalFamilyData(parsed)
      await fetchMembers()
      alert('Backup berhasil dipulihkan ke mode lokal.')
    } catch (error) {
      console.error('Gagal mengimpor backup:', error)
      alert('Format file backup tidak valid.')
    } finally {
      event.target.value = ''
    }
  }

  const handleUpgradePro = async () => {
    try {
      if (!isProUser()) {
        alert('Upgrade Pro memerlukan akun Pro. Fitur login Pro belum tersedia di aplikasi ini.')
        return
      }

      const shouldMigrate = window.confirm('Kami menemukan data lokal. Apakah Anda ingin mengunggahnya ke akun Pro Anda?')
      if (shouldMigrate) {
        const result = await migrateLocalToCloud()
        alert(`${result.migratedCount} data berhasil dimigrasikan ke cloud.`)
      }
      window.location.reload()
    } catch (error) {
      console.error('Upgrade gagal:', error)
      alert('Upgrade Pro belum tersedia untuk akun demo saat ini.')
    }
  }

  const isDemoMode = storageMode === STORAGE_MODES.DEMO

  return (
    <div className="app">
      <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      <main className="content-area">
        {isDemoMode && (
          <div className="demo-storage-banner">
            <div>
              <strong>Mode Demo:</strong> data keluarga tersimpan sementara di browser Anda.
            </div>
            <div className="demo-storage-actions">
              <button className="btn btn-secondary" type="button" onClick={handleExportBackup}>
                Backup JSON
              </button>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                Import JSON
                <input type="file" accept="application/json" hidden onChange={handleImportBackup} />
              </label>
              <button className="btn btn-primary" type="button" onClick={handleUpgradePro}>
                Upgrade Pro
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tree' && (
          <TreeView members={members} onSelectMember={handleSelectMember} />
        )}
        {activeTab === 'list' && (
          <ListView members={members} onSelectMember={handleSelectMember} />
        )}
        {activeTab === 'stats' && <StatsView members={members} />}
      </main>

      <Fab onClick={handleOpenAdd} />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <MemberFormModal
        isOpen={isFormOpen}
        member={editingMember}
        allMembers={members}
        onSave={handleSaveMember}
        onClose={() => setIsFormOpen(false)}
      />

      <MemberDetailModal
        isOpen={isDetailOpen}
        member={selectedMember}
        allMembers={members}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteMember}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  )
}

export default App