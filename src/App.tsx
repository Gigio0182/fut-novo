import PowerRanking from './PowerRanking'

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      <div className="rounded-[40px] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_32px_64px_rgba(0,0,0,0.6)]">
        <PowerRanking />
      </div>
    </div>
  )
}
