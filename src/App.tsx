import React, { useState } from 'react'
import { TierListSelector } from './components/TierListSelector'
import { ComparisonView } from './components/ComparisonView'
import { TierListDisplay } from './components/TierListDisplay'
import { AdminPanel } from './components/AdminPanel'
import { TierList } from './lib/supabase'

type View = 'home' | 'comparison' | 'tierlist' | 'admin'

function App() {
  const [currentView, setCurrentView] = useState<View>('home')
  const [selectedTierList, setSelectedTierList] = useState<TierList | null>(null)

  const handleSelectTierList = (tierList: TierList) => {
    setSelectedTierList(tierList)
    setCurrentView('comparison')
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <TierListSelector
            onSelectTierList={handleSelectTierList}
            onShowAdmin={() => setCurrentView('admin')}
          />
        )

      case 'comparison':
        if (!selectedTierList) {
          setCurrentView('home')
          return null
        }
        return (
          <ComparisonView
            tierList={selectedTierList}
            onBack={() => setCurrentView('home')}
            onShowTierList={() => setCurrentView('tierlist')}
          />
        )

      case 'tierlist':
        if (!selectedTierList) {
          setCurrentView('home')
          return null
        }
        return (
          <TierListDisplay
            tierList={selectedTierList}
            onBack={() => setCurrentView('home')}
            onCompare={() => setCurrentView('comparison')}
          />
        )

      case 'admin':
        return (
          <AdminPanel
            onBack={() => setCurrentView('home')}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  )
}

export default App