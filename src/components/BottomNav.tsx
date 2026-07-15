import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const location = useLocation()
  const isMatch = location.pathname === '/'
  const isRanking = location.pathname === '/ranking'

  return (
    <nav className="mx-auto flex max-w-[402px] items-center justify-between rounded-full border border-white/10 bg-[#111218] px-2 py-2 shadow-lg">
      <Link
        to="/"
        className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold ${isMatch ? 'bg-[#d2fc38] text-[#0a0a0c]' : 'text-white'}`}
      >
        Match
      </Link>
      <Link
        to="/ranking"
        className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold ${isRanking ? 'bg-[#d2fc38] text-[#0a0a0c]' : 'text-white'}`}
      >
        Ranking
      </Link>
    </nav>
  )
}
