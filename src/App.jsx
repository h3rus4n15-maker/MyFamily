import React, { useState } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Fab from './components/Fab'
import TreeView from './views/TreeView'
import ListView from './views/ListView'
import StatsView from './views/StatsView'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('tree')

  const handleReset = () => {
    alert('Data direset ke contoh (placeholder).')
  }

  const handleAdd = () => {
    alert('Tambah anggota (placeholder).')
  }

  return (
    <div className="app">
      <Header onReset={handleReset} />
      <main className="content-area">
        {activeTab === 'tree' && <TreeView />}
        {activeTab === 'list' && <ListView />}
        {activeTab === 'stats' && <StatsView />}
      </main>
      <Fab onClick={handleAdd} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
