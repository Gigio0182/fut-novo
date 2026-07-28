import { createContext, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import MatchPage from './pages/MatchPage'
import RankingPage from './pages/RankingPage'

interface PendingMatchContextType {
  isPendingMatch: boolean
  setPendingMatch: (isPending: boolean) => void
  showNavigationConfirm: boolean
  setShowNavigationConfirm: (show: boolean) => void
  pendingNavigationTo: string | null
  setPendingNavigationTo: (path: string | null) => void
}

export const PendingMatchContext = createContext<PendingMatchContextType>({
  isPendingMatch: false,
  setPendingMatch: () => {},
  showNavigationConfirm: false,
  setShowNavigationConfirm: () => {},
  pendingNavigationTo: null,
  setPendingNavigationTo: () => {},
})

function AppShell() {
  const [isPendingMatch, setIsPendingMatch] = useState(false)
  const [showNavigationConfirm, setShowNavigationConfirm] = useState(false)
  const [pendingNavigationTo, setPendingNavigationTo] = useState<string | null>(null)

  return (
    <PendingMatchContext.Provider
      value={{
        isPendingMatch,
        setPendingMatch: setIsPendingMatch,
        showNavigationConfirm,
        setShowNavigationConfirm,
        pendingNavigationTo,
        setPendingNavigationTo,
      }}
    >
      <div className="min-h-screen bg-[#0a0a0c] text-white">
        <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0c]/95 backdrop-blur">
          <div className="mx-auto max-w-[402px] px-4 py-4">
            <BottomNav />
          </div>
        </div>
        <Routes>
          <Route path="/" element={<MatchPage />} />
          <Route path="/ranking" element={<RankingPage />} />
        </Routes>
      </div>
    </PendingMatchContext.Provider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
