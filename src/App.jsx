import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Fab from './components/Fab'
import TreeView from './views/TreeView'
import ListView from './views/ListView'
import StatsView from './views/StatsView'
import MemberFormModal from './components/MemberFormModal.jsx'
import MemberDetailModal from './components/MemberDetailModal.jsx'
import { FamilyDB } from './storage/db'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('tree')
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Load members on mount
  useEffect(() => {
    const data = FamilyDB.getMembers()
    setMembers(data)
  }, [])

  const reloadMembers = () => {
    const updated = FamilyDB.getMembers()
    setMembers([...updated])
  }

  const handleReset = () => {
    if (confirm('Reset data ke silsilah contoh awal (3 Generasi)? Data yang Anda ubah akan digantikan data awal.')) {
      const defaultData = FamilyDB.resetToDefault()
      setMembers([...defaultData])
    }
  }

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

  const handleSaveMember = (id, memberData) => {
    if (id) {
      FamilyDB.updateMember(id, memberData)
    } else {
      FamilyDB.addMember(memberData)
    }
    reloadMembers()
  }

  const handleDeleteMember = (id) => {
    FamilyDB.deleteMember(id)
    reloadMembers()
  }

  return (
    <div className="app" id="app">
      <Header onReset={handleReset} />
      <main className="content-area">
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

      {/* Modals */}
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
