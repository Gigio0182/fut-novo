import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkDuplicates, parseAthleteList, saveAthletes } from '../lib/athleteService'
import { saveMatch, updateRankings } from '../lib/matchService'
import type { GoalEvent, Match } from '../types'

type Step = 'upload' | 'teams' | 'scoring' | 'awards' | 'success'

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
  const [goals, setGoals] = useState<Record<string, number>>({})
  const [assists, setAssists] = useState<Record<string, number>>({})
  const [ownGoalEvents, setOwnGoalEvents] = useState<GoalEvent[]>([])
  const [awards, setAwards] = useState({ mvpId: '', bestDefenderId: '', badPlayerId: '' })
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [goalModalPlayer, setGoalModalPlayer] = useState<string | null>(null)
  const [goalModalOwnGoal, setGoalModalOwnGoal] = useState(false)
  const [goalModalAssist, setGoalModalAssist] = useState('')
  const [showAssistList, setShowAssistList] = useState(false)
  const [goalModalError, setGoalModalError] = useState('')

  const players = [...teamA, ...teamB]
  const regularGoalsA = teamA.reduce((total, name) => total + (goals[name] ?? 0), 0)
  const regularGoalsB = teamB.reduce((total, name) => total + (goals[name] ?? 0), 0)
  const ownGoalsA = ownGoalEvents.filter((event) => event.team === 'A').length
  const ownGoalsB = ownGoalEvents.filter((event) => event.team === 'B').length
  const totalGoalsA = regularGoalsA + ownGoalsB
  const totalGoalsB = regularGoalsB + ownGoalsA
  const hasAnyGoal = Object.values(goals).some((count) => count > 0) || ownGoalEvents.length > 0
  const hasPlayers = players.length > 0

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
    setGoals((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
    setAssists((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const updateGoal = (name: string, delta: number) => {
    setGoals((prev) => ({ ...prev, [name]: Math.max(0, (prev[name] ?? 0) + delta) }))
  }

  const updateAssist = (name: string, delta: number) => {
    setAssists((prev) => ({ ...prev, [name]: Math.max(0, (prev[name] ?? 0) + delta) }))
  }

  const openGoalModal = (name: string) => {
    setGoalModalPlayer(name)
    setGoalModalOwnGoal(false)
    setGoalModalAssist('')
    setShowAssistList(false)
    setGoalModalError('')
  }

  const closeGoalModal = () => {
    setGoalModalPlayer(null)
    setGoalModalOwnGoal(false)
    setGoalModalAssist('')
    setShowAssistList(false)
    setGoalModalError('')
  }

  const confirmGoalModal = () => {
    if (!goalModalPlayer) {
      return
    }

    if (goalModalAssist && goalModalAssist === goalModalPlayer) {
      setGoalModalError('O autor do gol nao pode ser o assistente.')
      return
    }

    if (goalModalOwnGoal) {
      const team = teamA.includes(goalModalPlayer) ? 'A' : 'B'
      setOwnGoalEvents((prev) => [...prev, { athleteId: goalModalPlayer, team }])
      closeGoalModal()
      return
    }

    updateGoal(goalModalPlayer, 1)

    if (goalModalAssist) {
      updateAssist(goalModalAssist, 1)
    }

    closeGoalModal()
  }

  const handleSwitchTeam = (name: string) => {
    const target = teamA.includes(name) ? 'B' : 'A'
    moveAthlete(name, target as 'A' | 'B')
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
        goals: Object.entries(goals)
          .filter(([, count]) => count > 0)
          .flatMap(([athleteId, count]) =>
            Array.from({ length: count }, () => ({
              athleteId,
              team: teamA.includes(athleteId) ? 'A' : 'B',
            })),
          ),
        assists: Object.entries(assists)
          .filter(([, count]) => count > 0)
          .flatMap(([athleteId, count]) =>
            Array.from({ length: count }, () => ({
              athleteId,
              team: teamA.includes(athleteId) ? 'A' : 'B',
            })),
          ),
        ownGoals: ownGoalEvents,
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
              onClick={() => handleSwitchTeam(name)}
              className="rounded-full border border-[#d2fc38]/25 bg-[#d2fc38]/10 p-1.5 text-[12px] text-[#d2fc38] transition hover:bg-[#d2fc38]/20"
              aria-label={`Trocar ${name} de time`}
              title="Trocar de time"
            >
              ↔
            </button>
            <button
              onClick={() => openGoalModal(name)}
              className="rounded-full border border-[#d2fc38]/20 bg-[#d2fc38] px-3 py-1.5 text-[11px] font-semibold text-[#0a0a0c] transition hover:brightness-95"
              aria-label={`Registrar gol para ${name}`}
              title="Registrar gol"
            >
              GOL
            </button>
          </div>
        </div>
      </div>
    )
  }

  const goalModalTeamPlayers = goalModalPlayer
    ? (teamA.includes(goalModalPlayer) ? teamA : teamB).filter((name) => name !== goalModalPlayer)
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

            {goalModalPlayer ? (
              <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-4 sm:items-center">
                <div className="w-full max-w-[360px] rounded-3xl border border-white/10 bg-[#111218] p-4 shadow-2xl">
                  <h3 className="text-base font-semibold text-[#d2fc38]">Registrar gol</h3>
                  <p className="mt-1 text-sm text-white">{goalModalPlayer}</p>

                  <label className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0c] px-3 py-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={goalModalOwnGoal}
                      onChange={(event) => {
                        const checked = event.target.checked
                        setGoalModalOwnGoal(checked)
                        if (checked) {
                          setGoalModalAssist('')
                          setShowAssistList(false)
                        }
                        setGoalModalError('')
                      }}
                    />
                    Gol contra
                  </label>

                  <div className="mt-3">
                    <p className="mb-2 text-sm text-[#8e919e]">Assistencia</p>
                    <button
                      disabled={goalModalOwnGoal}
                      onClick={() => setShowAssistList((prev) => !prev)}
                      className="w-full rounded-2xl border border-white/10 bg-[#0a0a0c] px-3 py-2 text-left text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {goalModalAssist || 'Selecionar assistente'}
                    </button>

                    {showAssistList && !goalModalOwnGoal ? (
                      <div className="mt-2 max-h-40 overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0c]">
                        {goalModalTeamPlayers.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-[#8e919e]">Sem outro jogador disponivel.</p>
                        ) : (
                          goalModalTeamPlayers.map((name) => (
                            <button
                              key={name}
                              onClick={() => {
                                setGoalModalAssist(name)
                                setShowAssistList(false)
                                setGoalModalError('')
                              }}
                              className="block w-full border-b border-white/5 px-3 py-2 text-left text-sm text-white last:border-b-0 hover:bg-white/5"
                            >
                              {name}
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>

                  {goalModalError ? <p className="mt-3 text-sm text-red-300">{goalModalError}</p> : null}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button onClick={closeGoalModal} className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-white">
                      Cancelar
                    </button>
                    <button onClick={confirmGoalModal} className="rounded-2xl bg-[#d2fc38] px-3 py-2 text-sm font-semibold text-[#0a0a0c]">
                      Confirmar
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
