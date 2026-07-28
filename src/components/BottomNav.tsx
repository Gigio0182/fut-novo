import { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PendingMatchContext } from '../App'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isPendingMatch, setPendingNavigationTo } = useContext(PendingMatchContext)
  const [showConfirm, setShowConfirm] = useState(false)
  const isMatch = location.pathname === '/'
  const isRanking = location.pathname === '/ranking'

  const handleNavigation = (path: string) => {
    if (isPendingMatch && path !== location.pathname) {
      setShowConfirm(true)
      setPendingNavigationTo(path)
      return
    }
    navigate(path)
  }

  const confirmNavigation = () => {
    setShowConfirm(false)
    const path = location.pathname === '/' ? '/ranking' : '/'
    setPendingNavigationTo(null)
    navigate(path)
  }

  const cancelNavigation = () => {
    setShowConfirm(false)
    setPendingNavigationTo(null)
  }

  return (
    <>
      <nav className="mx-auto flex max-w-[402px] items-center justify-between rounded-full border border-white/10 bg-[#111218] px-2 py-2 shadow-lg">
        <button
          onClick={() => handleNavigation('/')}
          className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold ${isMatch ? 'bg-[#d2fc38] text-[#0a0a0c]' : 'text-white'}`}
        >
          Match
        </button>
        <button
          onClick={() => handleNavigation('/ranking')}
          className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold ${isRanking ? 'bg-[#d2fc38] text-[#0a0a0c]' : 'text-white'}`}
        >
          Ranking
        </button>
      </nav>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-[340px] rounded-3xl border border-white/10 bg-[#111218] p-4 shadow-2xl">
            <h2 className="text-lg font-semibold text-[#d2fc38]">Cancelar partida?</h2>
            <p className="mt-2 text-sm text-[#8e919e]">
              Você tem uma partida em andamento. Deseja realmente sair? Todos os dados serão perdidos.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={cancelNavigation}
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Voltar
              </button>
              <button
                onClick={confirmNavigation}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
