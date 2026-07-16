import { BrowserRouter, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import MatchPage from './pages/MatchPage'
import RankingPage from './pages/RankingPage'

function AppShell() {
  return (
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
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
