import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Fab from './components/Fab'
import TreeView from './views/TreeView'
import ListView from './views/ListView'
import StatsView from './views/StatsView'
import MemberFormModal from './components/MemberFormModal.jsx'
import MemberDetailModal from './components/MemberDetailModal.jsx'
import { db } from './firebase'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('tree')
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchMembers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'members'))
      const dataList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
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
    const unsubscribe = onSnapshot(collection(db, 'members'), (querySnapshot) => {
      const dataList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMembers(dataList)
    }, (error) => {
      console.error('Gagal memantau data:', error)
    })

    return () => unsubscribe()
  }, [])

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
    console.log('[App] refresh members setelah simpan')
    await fetchMembers()
  }

  const handleDeleteMember = async (id) => {
    try {
      await deleteDoc(doc(db, 'members', id))
      await fetchMembers()
    } catch (error) {
      console.error('Gagal menghapus data:', error)
      alert('Terjadi kesalahan saat menghapus data.')
    }
  }

  return (
    <div className="app">
      <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />
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