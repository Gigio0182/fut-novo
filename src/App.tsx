import { BrowserRouter, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import MatchPage from './pages/MatchPage'
import RankingPage from './pages/RankingPage'

function AppShell() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <div className="mx-auto max-w-[402px] px-4 py-4">
        <BottomNav />
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
