import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkDuplicates, parseAthleteList, saveAthletes } from '../lib/athleteService'
import { saveMatch, updateRankings } from '../lib/matchService'
import type { Match } from '../types'

type Step = 'upload' | 'teams' | 'scoring' | 'awards' | 'success'

type TeamSide = 'A' | 'B'

interface GoalEntry {
  scorerId: string
  scorerTeam: TeamSide
  assistId: string | null
  assistTeam: TeamSide | null
  ownGoal: boolean
}

interface GoalDialogState {
  scorerId: string
  scorerTeam: TeamSide
  assistId: string
  ownGoal: boolean
}

function formatName(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export default function MatchPage() {
  const navigate = useNavigate()
  const [rawList, setRawList] = useState('')
  const [parsedNames, setParsedNames] = useState<string[]>([])
  const [duplicates, setDuplicates] = useState<string[]>([])
  const [step, setStep] = useState<Step>('upload')
  const [teamA, setTeamA] = useState<string[]>([])
  const [teamB, setTeamB] = useState<string[]>([])
  const [manualName, setManualName] = useState('')
  const [manualError, setManualError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [goalEntries, setGoalEntries] = useState<GoalEntry[]>([])
  const [awards, setAwards] = useState({ mvpId: '', bestDefenderId: '', badPlayerId: '' })
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [goalDialog, setGoalDialog] = useState<GoalDialogState | null>(null)

  const players = [...teamA, ...teamB]
  const totalGoalsA = goalEntries.reduce((total, entry) => {
    if (entry.scorerTeam === 'A') {
      return total + (entry.ownGoal ? 0 : 1)
    }

    return total + (entry.ownGoal ? 1 : 0)
  }, 0)
  const totalGoalsB = goalEntries.reduce((total, entry) => {
    if (entry.scorerTeam === 'B') {
      return total + (entry.ownGoal ? 0 : 1)
    }

    return total + (entry.ownGoal ? 1 : 0)
  }, 0)
  const hasAnyGoal = goalEntries.length > 0
  const hasPlayers = players.length > 0

  const getPlayerTeam = (name: string): TeamSide => (teamA.includes(name) ? 'A' : 'B')

  const handleUpload = async () => {
    const names = parseAthleteList(rawList)

    if (!names.length) {
      setUploadError('Adicione pelo menos um atleta para continuar.')
      return
    }

    setUploadError('')
    setIsSaving(true)

    try {
      const result = await checkDuplicates(names)
      setParsedNames(names)
      setDuplicates(result.existing)
      await saveAthletes(names)

      const splitIndex = Math.ceil(names.length / 2)
      setTeamA(names.slice(0, splitIndex))
      setTeamB(names.slice(splitIndex))
      setStep('teams')
    } catch (error) {
      const message = error instanceof Error && error.message === 'Firestore permission denied'
        ? 'Não foi possível salvar os atletas. Ative as regras do Firestore para permitir escrita na coleção athletes.'
        : 'Não foi possível salvar os atletas. Verifique as permissões do Firestore.'
      setUploadError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const moveAthlete = (name: string, target: 'A' | 'B') => {
    if (target === 'A') {
      setTeamA((prev) => (prev.includes(name) ? prev : [...prev, name]))
      setTeamB((prev) => prev.filter((item) => item !== name))
      return
    }

    setTeamB((prev) => (prev.includes(name) ? prev : [...prev, name]))
    setTeamA((prev) => prev.filter((item) => item !== name))
  }

  const handleAddAthlete = () => {
    const normalized = formatName(manualName)
    if (!normalized) {
      setManualError('Digite um nome válido')
      return
    }

    const existing = [...teamA, ...teamB].some((name) => name.toLowerCase() === normalized.toLowerCase())
    if (existing) {
      setManualError('Este atleta já está na lista')
      return
    }

    setTeamA((prev) => [...prev, normalized])
    setManualName('')
    setManualError('')
  }

  const removeAthlete = (name: string) => {
    setTeamA((prev) => prev.filter((item) => item !== name))
    setTeamB((prev) => prev.filter((item) => item !== name))
    setGoalEntries((prev) => prev.filter((entry) => entry.scorerId !== name && entry.assistId !== name))
    setGoalDialog((prev) => (prev?.scorerId === name || prev?.assistId === name ? null : prev))
  }

  const handleSwitchTeam = (name: string) => {
    const target = teamA.includes(name) ? 'B' : 'A'
    moveAthlete(name, target as 'A' | 'B')
  }

  const openGoalDialog = (name: string) => {
    setGoalDialog({
      scorerId: name,
      scorerTeam: getPlayerTeam(name),
      assistId: '',
      ownGoal: false,
    })
  }

  const closeGoalDialog = () => {
    setGoalDialog(null)
  }

  const confirmGoalDialog = () => {
    if (!goalDialog) {
      return
    }

    setGoalEntries((prev) => [
      ...prev,
      {
        scorerId: goalDialog.scorerId,
        scorerTeam: goalDialog.scorerTeam,
        assistId: goalDialog.assistId || null,
        assistTeam: goalDialog.assistId ? goalDialog.scorerTeam : null,
        ownGoal: goalDialog.ownGoal,
      },
    ])
    closeGoalDialog()
  }

  const handleFinish = () => {
    setStep('awards')
  }

  const handleSaveMatch = async () => {
    setSaveError('')

    try {
      const matchData: Omit<Match, 'id'> = {
        date: new Date().toISOString(),
        teamA,
        teamB,
        goals: goalEntries.map((entry) => ({
          athleteId: entry.scorerId,
          team: entry.ownGoal ? (entry.scorerTeam === 'A' ? 'B' : 'A') : entry.scorerTeam,
        })),
        assists: goalEntries
          .filter((entry) => entry.assistId && entry.assistTeam)
          .map((entry) => ({
            athleteId: entry.assistId as string,
            team: entry.assistTeam as TeamSide,
          })),
        mvpId: awards.mvpId || null,
        bestDefenderId: awards.bestDefenderId || null,
        badPlayerId: awards.badPlayerId || null,
        finishedAt: new Date().toISOString(),
      }

      const matchId = await saveMatch(matchData)
      await updateRankings({ id: matchId, ...matchData })
      setSaveMessage(`Partida salva com sucesso. ID: ${matchId}`)
      setStep('success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar a partida. Tente novamente.'
      setSaveError(message)
    }
  }

  const renderPlayerRow = (name: string) => {
    return (
      <div key={name} className="overflow-hidden rounded-2xl border border-white/10 bg-[#111218] px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 flex-1 text-sm font-medium text-white">{name}</span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              onClick={() => openGoalDialog(name)}
              className="rounded-full bg-[#d2fc38] px-3 py-1.5 text-[11px] font-semibold text-[#0a0a0c] transition hover:bg-[#ddff5c]"
            >
              GOL
            </button>
            <button
              onClick={() => handleSwitchTeam(name)}
              className="rounded-full border border-[#d2fc38]/25 bg-[#d2fc38]/10 p-1.5 text-[12px] text-[#d2fc38] transition hover:bg-[#d2fc38]/20"
              aria-label={`Trocar ${name} de time`}
              title="Trocar de time"
            >
              ↔
            </button>
          </div>
        </div>
      </div>
    )
  }

  const goalDialogTeamPlayers = goalDialog
    ? (goalDialog.scorerTeam === 'A' ? teamA : teamB).filter((playerName) => playerName !== goalDialog.scorerId)
    : []

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] px-4 py-4 text-white sm:px-6">
      <div className="w-full max-w-[420px] rounded-[32px] border border-white/10 bg-[#111218] p-4 shadow-2xl sm:p-5">
        <div className="mb-5 rounded-[24px] border border-white/10 bg-gradient-to-br from-[#16181f] to-[#0d0f13] p-4">
          <h1 className="text-center text-2xl font-bold text-[#d2fc38]">Craques da Volvo</h1>
        </div>

        {step === 'upload' ? (
          <div className="space-y-4">
            <label className="block text-sm text-[#8e919e]">
              Cole a lista de atletas
              <textarea
                value={rawList}
                onChange={(event) => setRawList(event.target.value)}
                className="mt-2 min-h-[140px] w-full rounded-2xl border border-[#d2fc38]/70 bg-[#d2fc38]/10 p-3 text-sm text-white outline-none shadow-[0_0_0_1px_rgba(210,252,56,0.2)] focus:border-[#d2fc38] focus:bg-[#d2fc38]/15"
                placeholder="1. João Silva\n2-Maria Souza"
              />
            </label>

            {uploadError ? <p className="text-sm text-red-300">{uploadError}</p> : null}

            <button
              onClick={handleUpload}
              disabled={isSaving}
              className="w-full rounded-2xl bg-[#d2fc38] px-4 py-3 font-semibold text-[#0a0a0c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Uploading...' : 'Upload'}
            </button>

            {parsedNames.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] p-3">
                <p className="mb-2 text-sm font-semibold text-[#d2fc38]">Atletas encontrados</p>
                <div className="flex flex-wrap gap-2">
                  {parsedNames.map((name) => (
                    <span
                      key={name}
                      className={`rounded-full px-3 py-1 text-sm ${duplicates.includes(name) ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white'}`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
                {duplicates.length > 0 && (
                  <p className="mt-3 text-sm text-red-300">Alguns nomes já existem no banco e serão ignorados.</p>
                )}
              </div>
            )}
          </div>
        ) : step === 'teams' ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-semibold text-[#d2fc38]">Time A</h2>
                  <span className="text-xs text-[#8e919e]">{teamA.length}</span>
                </div>
                <div className="flex min-h-[120px] flex-wrap gap-2">
                  {teamA.map((name) => (
                    <button
                      key={name}
                      onClick={() => moveAthlete(name, 'B')}
                      className="rounded-full border border-[#d2fc38]/40 bg-[#d2fc38]/10 px-3 py-1 text-sm text-[#d2fc38]"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-semibold text-[#d2fc38]">Time B</h2>
                  <span className="text-xs text-[#8e919e]">{teamB.length}</span>
                </div>
                <div className="flex min-h-[120px] flex-wrap gap-2">
                  {teamB.map((name) => (
                    <button
                      key={name}
                      onClick={() => moveAthlete(name, 'A')}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] p-3">
              <label className="block text-sm text-[#8e919e]">
                Adicionar atleta manualmente
                <input
                  value={manualName}
                  onChange={(event) => setManualName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#111218] p-3 text-sm text-white outline-none"
                  placeholder="Nome do atleta"
                />
              </label>
              {manualError ? <p className="mt-2 text-sm text-red-300">{manualError}</p> : null}
              <button onClick={handleAddAthlete} className="mt-3 w-full rounded-2xl bg-[#d2fc38] px-4 py-3 font-semibold text-[#0a0a0c]">
                Adicionar
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] p-3">
              <p className="mb-2 text-sm font-semibold text-[#d2fc38]">Lista total</p>
              <div className="flex flex-wrap gap-2">
                {players.map((name) => (
                  <div key={name} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white">
                    <span>{name}</span>
                    <button onClick={() => removeAthlete(name)} className="text-[#d2fc38]">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled={teamA.length < 1 || teamB.length < 1}
              className="w-full rounded-2xl bg-[#d2fc38] px-4 py-3 font-semibold text-[#0a0a0c] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setStep('scoring')}
            >
              Start Match
            </button>
          </div>
        ) : step === 'scoring' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] p-3 text-center">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8e919e]">Placar</p>
              <div className="mt-2 flex items-center justify-center gap-4 text-3xl font-bold">
                <span className="text-[#d2fc38]">{totalGoalsA}</span>
                <span className="text-white">x</span>
                <span className="text-[#d2fc38]">{totalGoalsB}</span>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] p-3">
                <h2 className="mb-2 text-sm font-semibold text-[#d2fc38]">Time A</h2>
                <div className="space-y-2">
                  {teamA.map((name) => renderPlayerRow(name))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] p-3">
                <h2 className="mb-2 text-sm font-semibold text-[#d2fc38]">Time B</h2>
                <div className="space-y-2">
                  {teamB.map((name) => renderPlayerRow(name))}
                </div>
              </div>
            </div>

            <button
              disabled={!hasAnyGoal}
              className="w-full rounded-2xl bg-[#d2fc38] px-4 py-3 font-semibold text-[#0a0a0c] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleFinish}
            >
              Finish Match
            </button>

            {goalDialog ? (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-6 sm:items-center">
                <div className="w-full max-w-[420px] rounded-[28px] border border-white/10 bg-[#111218] p-4 shadow-2xl">
                  <h3 className="text-lg font-semibold text-[#d2fc38]">Registrar gol</h3>
                  <p className="mt-1 text-sm text-[#8e919e]">Jogador: {goalDialog.scorerId}</p>

                  <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0a0c] px-3 py-3 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={goalDialog.ownGoal}
                      onChange={(event) =>
                        setGoalDialog((prev) => (prev ? { ...prev, ownGoal: event.target.checked } : prev))
                      }
                      className="size-4 accent-[#d2fc38]"
                    />
                    <span>Gol contra</span>
                  </label>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-[#8e919e]">Assistente</p>
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0c] p-2">
                      <button
                        type="button"
                        onClick={() => setGoalDialog((prev) => (prev ? { ...prev, assistId: '' } : prev))}
                        className={`w-full rounded-2xl px-3 py-2 text-left text-sm transition ${goalDialog.assistId === '' ? 'bg-[#d2fc38] text-[#0a0a0c]' : 'bg-white/5 text-white hover:bg-white/10'}`}
                      >
                        Sem assistencia
                      </button>
                      {goalDialogTeamPlayers.map((playerName) => (
                        <button
                          key={playerName}
                          type="button"
                          onClick={() => setGoalDialog((prev) => (prev ? { ...prev, assistId: playerName } : prev))}
                          className={`w-full rounded-2xl px-3 py-2 text-left text-sm transition ${goalDialog.assistId === playerName ? 'bg-[#d2fc38] text-[#0a0a0c]' : 'bg-white/5 text-white hover:bg-white/10'}`}
                        >
                          {playerName}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={closeGoalDialog}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmGoalDialog}
                      className="flex-1 rounded-2xl bg-[#d2fc38] px-4 py-3 font-semibold text-[#0a0a0c]"
                    >
                      Confirmar gol
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : step === 'awards' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] p-3">
              <label className="mb-3 block text-sm text-[#8e919e]">
                MVP
                <select
                  value={awards.mvpId}
                  onChange={(event) => setAwards((prev) => ({ ...prev, mvpId: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#111218] p-3 text-sm text-white outline-none"
                >
                  <option value="">Selecione</option>
                  {players.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mb-3 block text-sm text-[#8e919e]">
                Melhor Defensor
                <select
                  value={awards.bestDefenderId}
                  onChange={(event) => setAwards((prev) => ({ ...prev, bestDefenderId: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#111218] p-3 text-sm text-white outline-none"
                >
                  <option value="">Selecione</option>
                  {players.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-[#8e919e]">
                Pior em Campo
                <select
                  value={awards.badPlayerId}
                  onChange={(event) => setAwards((prev) => ({ ...prev, badPlayerId: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#111218] p-3 text-sm text-white outline-none"
                >
                  <option value="">Selecione</option>
                  {players.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {saveError ? <p className="text-sm text-red-300">{saveError}</p> : null}
            <button
              disabled={!hasPlayers}
              onClick={handleSaveMatch}
              className="w-full rounded-2xl bg-[#d2fc38] px-4 py-3 font-semibold text-[#0a0a0c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirmar & Salvar
            </button>
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-[#d2fc38]/30 bg-[#0a0a0c] p-4 text-center">
            <h2 className="text-xl font-semibold text-[#d2fc38]">Partida salva!</h2>
            <p className="text-sm text-[#8e919e]">{saveMessage}</p>
            <button onClick={() => navigate('/ranking')} className="w-full rounded-2xl border border-[#d2fc38]/40 px-4 py-3 font-semibold text-[#d2fc38]">
              Go to Ranking
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
