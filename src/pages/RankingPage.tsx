import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import PowerRanking from '../PowerRanking'
import { db } from '../lib/firebase'
import type { RankingEntry } from '../types'

interface Player {
  rank: number
  name: string
  team: string
  g: number
  a: number
  mvp: number
  mvpHL: boolean
  md: number
  p: number
  pior: number
  ptos: string
}

export default function RankingPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rankingsRef = query(collection(db, 'rankings'), orderBy('points', 'desc'))
    const unsubscribe = onSnapshot(rankingsRef, (snapshot) => {
      const nextPlayers = snapshot.docs.map((doc, index) => {
        const entry = doc.data() as RankingEntry
        return {
          rank: index + 1,
          name: entry.name,
          team: 'VOLVO',
          g: entry.goals,
          a: entry.assists,
          mvp: entry.mvps,
          mvpHL: entry.mvps > 0,
          md: entry.bestDefender,
          p: entry.matches,
          pior: entry.badPlayer,
          ptos: entry.points.toFixed(1),
        } satisfies Player
      })

      setPlayers(nextPlayers)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0c] px-2 py-3 text-white">
      <div className="mx-auto max-w-[402px] rounded-[32px] border border-white/10 bg-[#111218] p-2 shadow-2xl">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-8 animate-pulse rounded bg-white/10" />
            <div className="h-8 animate-pulse rounded bg-white/10" />
            <div className="h-8 animate-pulse rounded bg-white/10" />
          </div>
        ) : players.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#8e919e]">No matches yet</div>
        ) : (
          <PowerRanking players={players} />
        )}
      </div>
    </div>
  )
}
