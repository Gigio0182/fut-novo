export interface Athlete {
  id: string
  name: string
  createdAt: string
}

export interface GoalEvent {
  athleteId: string
  team: 'A' | 'B'
}

export interface AssistEvent {
  athleteId: string
  team: 'A' | 'B'
}

export interface Match {
  id: string
  date: string
  teamA: string[]
  teamB: string[]
  goals: GoalEvent[]
  assists: AssistEvent[]
  mvpId: string | null
  bestDefenderId: string | null
  badPlayerId: string | null
  finishedAt: string
}

export interface RankingEntry {
  athleteId: string
  name: string
  matches: number
  goals: number
  assists: number
  mvps: number
  bestDefender: number
  badPlayer: number
  points: number
}
