import { useMemo, useState } from 'react'

interface Player {
  rank: number;
  name: string;
  team: string;
  g: number;
  a: number;
  mvp: number;
  mvpHL: boolean;
  md: number;
  p: number;
  pior: number;
  ptos: string;
}

const TABS = ['Todos Jogadores', 'Goleadores', 'Garçons', 'Defensores', 'Participações'];

const TOP_BADGE_COLORS: Record<number, string> = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' };
const TOP_ROW_BG: Record<number, string> = {
  1: 'rgba(255,215,0,0.08)',
  2: 'rgba(192,192,192,0.08)',
  3: 'rgba(205,127,50,0.08)',
};
const TOP_BORDER_COLOR: Record<number, string> = {
  1: 'rgba(255,215,0,0.2)',
  2: 'rgba(192,192,192,0.2)',
  3: 'rgba(205,127,50,0.2)',
};

function PlayerRow({ player, activeTab }: { player: Player; activeTab: number }) {
  const isTop3 = player.rank <= 3;
  const isTop = player.rank <= 3;
  const isSortedColumn = activeTab === 0
    ? false
    : activeTab === 1
      ? 'g'
      : activeTab === 2
        ? 'a'
        : activeTab === 3
          ? 'md'
          : activeTab === 4
            ? 'p'
            : null

  const columnValueClass = isSortedColumn === null
    ? 'text-[#8e919e]'
    : 'text-[#d2fc38]'

  const rowStyle = isTop3
    ? {
        background: TOP_ROW_BG[player.rank],
        borderColor: TOP_BORDER_COLOR[player.rank],
        borderStyle: 'solid' as const,
        borderWidth: '0 0 1px 2px',
      }
    : {
        background: player.rank % 2 === 0 ? '#171821' : '#111218',
        borderColor: '#1f212d',
        borderStyle: 'solid' as const,
        borderWidth: '0 0 1px 0',
      };

  return (
    <div
      className="flex items-center px-3 py-[14px] w-full shrink-0"
      style={rowStyle}
    >
      {/* Position */}
      <div className="flex items-center shrink-0 w-7">
        {isTop ? (
          <div
            className="flex items-center justify-center rounded-[9px] size-[18px] shrink-0"
            style={{ background: TOP_BADGE_COLORS[player.rank] }}
          >
            <span className="font-outfit font-black text-[11px] text-[#0a0a0c] leading-none">
              {player.rank}
            </span>
          </div>
        ) : (
          <span className="font-geist-mono font-bold text-[13px] text-[#8e919e] leading-none">
            {player.rank}
          </span>
        )}
      </div>

      {/* Player name + team */}
      <div className="flex flex-col gap-px items-start flex-1 min-w-0 whitespace-nowrap">
        <span
          className={`overflow-hidden text-ellipsis text-white text-[14px] leading-[18px] ${
            isTop ? 'font-outfit font-extrabold' : 'font-outfit font-bold'
          }`}
        >
          {player.name}
        </span>
        <span
          className={`font-outfit font-semibold text-[11px] uppercase leading-[14px] ${
            isTop ? 'text-[rgba(255,255,255,0.6)]' : 'text-[#50535e]'
          }`}
        >
          {player.team}
        </span>
      </div>

      {/* P */}
      <div className={`flex items-start justify-center shrink-0 w-5 ${isSortedColumn === 'p' ? 'bg-[rgba(210,252,56,0.05)]' : ''}`}>
        <span className={`font-geist-mono font-medium text-[13px] leading-none ${isSortedColumn === 'p' ? columnValueClass : 'text-[#8e919e]'}`}>
          {player.p}
        </span>
      </div>

      {/* G */}
      <div className={`flex items-start justify-center shrink-0 w-5 ${isSortedColumn === 'g' ? 'bg-[rgba(210,252,56,0.05)]' : ''}`}>
        <span className={`font-geist-mono font-medium text-[13px] leading-none ${isSortedColumn === 'g' ? columnValueClass : 'text-white'}`}>
          {player.g}
        </span>
      </div>

      {/* A */}
      <div className={`flex items-start justify-center shrink-0 w-5 ${isSortedColumn === 'a' ? 'bg-[rgba(210,252,56,0.05)]' : ''}`}>
        <span className={`font-geist-mono font-medium text-[13px] leading-none ${isSortedColumn === 'a' ? columnValueClass : 'text-white'}`}>
          {player.a}
        </span>
      </div>

      {/* MVP */}
      <div className="flex items-start justify-center shrink-0 w-7">
        {player.mvpHL ? (
          <div className="bg-[rgba(210,252,56,0.12)] flex items-center px-1 py-0.5 rounded shrink-0">
            <span className="font-geist-mono font-bold text-[12px] text-[#d2fc38] leading-none">
              {player.mvp}
            </span>
          </div>
        ) : (
          <span className="font-geist-mono font-medium text-[12px] text-[#8e919e] leading-none">
            {player.mvp}
          </span>
        )}
      </div>

      {/* MD */}
      <div className={`flex items-start justify-center shrink-0 w-[22px] ${isSortedColumn === 'md' ? 'bg-[rgba(210,252,56,0.05)]' : ''}`}>
        <span className={`font-geist-mono font-medium text-[13px] leading-none ${isSortedColumn === 'md' ? columnValueClass : 'text-[#8e919e]'}`}>
          {player.md}
        </span>
      </div>

      {/* Pior */}
      <div className="flex items-center justify-center shrink-0 w-7 overflow-hidden">
        <span className="font-geist-mono font-medium text-[13px] text-[#8e919e] leading-none">
          {player.pior}
        </span>
      </div>

      {/* Ptos */}
      <div className={`flex items-start justify-end shrink-0 w-12 ${isSortedColumn === null ? 'bg-[rgba(210,252,56,0.05)]' : ''}`}>
        <span
          className={`font-geist-mono font-extrabold text-[14px] leading-[18px] ${
            isSortedColumn === null ? 'text-[#d2fc38]' : isTop3 ? 'text-[#d2fc38]' : 'text-white'
          }`}
        >
          {player.ptos}
        </span>
      </div>
    </div>
  );
}

export default function PowerRanking({ players }: { players: Player[] }) {
  const [activeTab, setActiveTab] = useState(0)
  const sortedPlayers = useMemo(() => {
    const nextPlayers = [...players]

    switch (activeTab) {
      case 1:
        return nextPlayers.sort((a, b) => b.g - a.g)
      case 2:
        return nextPlayers.sort((a, b) => b.a - a.a)
      case 3:
        return nextPlayers.sort((a, b) => b.md - a.md)
      case 4:
        return nextPlayers.sort((a, b) => b.p - a.p)
      default:
        return nextPlayers.sort((a, b) => a.rank - b.rank)
    }
  }, [activeTab, players])

  return (
    <div className="flex min-h-screen w-full flex-col items-start overflow-hidden bg-[#0a0a0c]">
      {/* Hero Header */}
      <div className="flex flex-col gap-4 items-start pb-5 pt-2 px-4 w-full shrink-0">
        <h1 className="font-inter font-bold text-[22px] text-[#d2fc38] leading-none whitespace-nowrap">
          Craques da Volvo
        </h1>

        {/* Filter tabs — horizontal scroll, no wrap */}
        <div className="flex gap-2 items-start overflow-x-auto overflow-y-hidden w-full shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`flex items-center px-4 py-2 rounded-lg shrink-0 ${
                i === activeTab
                  ? 'bg-[#d2fc38]'
                  : 'bg-[#111218] border border-[#1f212d]'
              }`}
            >
              <span
                className={`font-outfit font-bold text-[13px] uppercase whitespace-nowrap leading-none ${
                  i === activeTab ? 'text-[#0a0a0c]' : 'text-[#8e919e]'
                }`}
              >
                {tab}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Ranking Table — fills remaining space, clips & scrolls vertically */}
      <div className="flex flex-col items-start px-4 flex-1 min-h-0 overflow-hidden w-full">
        <div className="bg-[#111218] border border-[#1f212d] rounded-xl w-full flex flex-col overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Table Header */}
          <div className="flex items-center p-3 w-full shrink-0 bg-[#171821] border-b border-[#1f212d]">
            <div className="flex items-start shrink-0 w-7">
              <span className="font-outfit font-extrabold text-[11px] text-[#8e919e] uppercase leading-none">
                Pos
              </span>
            </div>
            <div className="flex-1 min-w-0 flex items-start">
              <span className="font-outfit font-extrabold text-[11px] text-[#8e919e] uppercase leading-none">
                Player
              </span>
            </div>
            <div className="flex items-start justify-center shrink-0 w-5">
              <span className="font-outfit font-extrabold text-[11px] uppercase leading-none text-[#8e919e]">J</span>
            </div>
            <div className={`flex items-start justify-center shrink-0 w-5 ${activeTab === 1 ? 'bg-[rgba(210,252,56,0.05)]' : ''}`}>
              <span className={`font-outfit font-extrabold text-[11px] uppercase leading-none ${activeTab === 1 ? 'text-[#d2fc38]' : 'text-[#8e919e]'}`}>G</span>
            </div>
            <div className={`flex items-start justify-center shrink-0 w-5 ${activeTab === 2 ? 'bg-[rgba(210,252,56,0.05)]' : ''}`}>
              <span className={`font-outfit font-extrabold text-[11px] uppercase leading-none ${activeTab === 2 ? 'text-[#d2fc38]' : 'text-[#8e919e]'}`}>A</span>
            </div>
            <div className="flex items-start justify-center shrink-0 w-7">
              <span className="font-outfit font-extrabold text-[11px] text-[#8e919e] uppercase leading-none">MVP</span>
            </div>
            <div className={`flex items-start justify-center shrink-0 w-[22px] ${activeTab === 3 ? 'bg-[rgba(210,252,56,0.05)]' : ''}`}>
              <span className={`font-outfit font-extrabold text-[11px] uppercase leading-none ${activeTab === 3 ? 'text-[#d2fc38]' : 'text-[#8e919e]'}`}>MD</span>
            </div>
            <div className={`flex items-center justify-center shrink-0 w-7 overflow-hidden ${activeTab === 4 ? 'bg-[rgba(210,252,56,0.05)]' : ''}`}>
              <span className={`font-outfit font-extrabold text-[11px] leading-none ${activeTab === 4 ? 'text-[#d2fc38]' : 'text-[#8e919e]'}`}>P</span>
            </div>
            <div className={`flex items-start justify-end shrink-0 w-12 ${activeTab === 0 ? 'bg-[rgba(210,252,56,0.05)]' : ''}`}>
              <span className={`font-outfit font-extrabold text-[11px] uppercase leading-none ${activeTab === 0 ? 'text-[#d2fc38]' : 'text-[#d2fc38]'}`}>Ptos</span>
            </div>
          </div>

          {/* Player Rows */}
          {sortedPlayers.map((player) => (
            <PlayerRow key={player.rank} player={player} activeTab={activeTab} />
          ))}
        </div>
      </div>

      {/* Footer Legend — always visible */}
      <div className="flex flex-col items-start pt-5 px-5 w-full shrink-0">
        <div className="h-px w-full bg-[#1f212d] mb-2" />
        <div className="flex flex-wrap gap-3 items-start w-full pt-2">
          {[
            ['G', 'Gols'],
            ['A', 'Assistências'],
            ['MVP', 'Melhor da partida'],
            ['MD', 'Melhor defensor'],
            ['J', 'Jogos'],
            ['Ptos', 'Pontos totais', true],
            ['P', 'Pior em campo'],
          ].map(([abbr, desc, isAccent]) => (
            <span key={String(abbr)} className="font-outfit font-normal text-[11px] text-[#50535e] leading-none whitespace-nowrap">
              <span className={`font-outfit font-bold text-[11px] ${isAccent ? 'text-[#d2fc38]' : 'text-[#8e919e]'}`}>
                {abbr}
              </span>
              {' '}{desc}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
