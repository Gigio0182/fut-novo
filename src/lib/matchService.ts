import { addDoc, collection, doc, runTransaction } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Match, RankingEntry } from '../types'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

export async function saveMatch(match: Omit<Match, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'matches'), match)
    return docRef.id
  } catch (error) {
    throw new Error(`saveMatch failed: ${getErrorMessage(error)}`)
  }
}

export async function updateRankings(match: Match): Promise<void> {
  const participants = Array.from(new Set([...match.teamA, ...match.teamB]))
  const goalCounts = new Map<string, number>()
  const assistCounts = new Map<string, number>()

  match.goals.forEach((goal) => {
    goalCounts.set(goal.athleteId, (goalCounts.get(goal.athleteId) ?? 0) + 1)
  })

  match.assists.forEach((assist) => {
    assistCounts.set(assist.athleteId, (assistCounts.get(assist.athleteId) ?? 0) + 1)
  })

  try {
    await runTransaction(db, async (transaction) => {
      const rankingRefs = participants.map((athleteId) => doc(db, 'rankings', athleteId))
      const existingSnapshots = await Promise.all(rankingRefs.map((rankingRef) => transaction.get(rankingRef)))

      for (let index = 0; index < participants.length; index += 1) {
        const athleteId = participants[index]
        const existing = existingSnapshots[index]
        const current = existing.exists() ? (existing.data() as unknown as RankingEntry) : null

        const goals = goalCounts.get(athleteId) ?? 0
        const assists = assistCounts.get(athleteId) ?? 0
        const mvps = match.mvpId === athleteId ? 1 : 0
        const bestDefender = match.bestDefenderId === athleteId ? 1 : 0
        const badPlayer = match.badPlayerId === athleteId ? 1 : 0
        const matches = (current?.matches ?? 0) + 1
        const points =
          (current?.points ?? 0) +
          0.5 +
          goals * 2.5 +
          assists * 1.5 +
          mvps * 3 +
          bestDefender * 3 +
          badPlayer * -0.5

        transaction.set(rankingRefs[index], {
          athleteId,
          name: current?.name ?? athleteId,
          matches,
          goals: (current?.goals ?? 0) + goals,
          assists: (current?.assists ?? 0) + assists,
          mvps: (current?.mvps ?? 0) + mvps,
          bestDefender: (current?.bestDefender ?? 0) + bestDefender,
          badPlayer: (current?.badPlayer ?? 0) + badPlayer,
          points,
        })
      }
    })
  } catch (error) {
    throw new Error(`updateRankings failed: ${getErrorMessage(error)}`)
  }
}
