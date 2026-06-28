import { useState, useMemo } from 'react';
import { useCopa } from '@/lib/copaState';
import { iaProbs, simularCopa, monteCarlo as runMonteCarlo } from '@/lib/copaEngine';
import FlagIcon from './FlagIcon';

export default function IARankSimPanel() {
  const { grResults } = useCopa();
  const [simResult, setSimResult] = useState(null);
  const [mcResult, setMcResult] = useState(null);

  const { sorted, maxP } = useMemo(() => {
    const probs = iaProbs(grResults);
    const s = Object.entries(probs).sort((a, b) => b[1] - a[1]);
    return { sorted: s, maxP: s[0]?.[1] || 1 };
  }, [grResults]);

  const handleSimulate = () => {
    setSimResult(simularCopa(grResults));
  };

  const handleMonteCarlo = () => {
    setMcResult(runMonteCarlo(grResults, 1000));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Ranking */}
      <div className="bg-card border border-border p-4">
        <div className="font-display text-[0.7rem] text-primary tracking-[0.12em] mb-3">🏆 RANKING IA — 48 SELEÇÕES</div>
        <div className="max-h-[600px] overflow-y-auto space-y-0">
          {sorted.map(([t, p], i) => (
            <div key={t} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-b-0 text-[0.82rem]">
              <div className={`font-mono text-[0.72rem] min-w-[22px] text-right ${i === 0 ? 'text-yellow-400 font-bold' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                {i + 1}
              </div>
              <FlagIcon team={t} size="sm" />
              <span className="flex-1 font-semibold text-[0.78rem]">{t}</span>
              <div className="flex-1 max-w-[70px] h-[3px] bg-white/5">
                <div className="h-full bg-gradient-to-r from-[hsl(150,100%,50%)] to-primary transition-all" style={{ width: `${p / maxP * 100}%` }} />
              </div>
              <span className="font-mono text-[0.72rem] text-primary min-w-[42px] text-right">{p.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Simulate */}
        <div className="bg-card border border-border p-4">
          <div className="font-display text-[0.7rem] text-primary tracking-[0.12em] mb-3">⚡ SIMULAR COPA COMPLETA</div>
          <div className="text-[0.78rem] text-muted-foreground mb-3 leading-relaxed">
            Simula o mata-mata com probabilidades históricas. Cada vez pode dar um resultado diferente!
          </div>
          <button onClick={handleSimulate}
            className="w-full font-display text-[0.58rem] font-bold border border-[hsl(25,100%,55%)] text-[hsl(25,100%,55%)] p-3 hover:bg-[hsl(25,100%,55%)]/10 transition-colors">
            ▶ SIMULAR
          </button>
          {simResult && (
            <div className="mt-3">
              <div className="bg-yellow-400/5 border border-yellow-400/30 p-4 text-center mb-3">
                <div className="font-display text-[0.6rem] text-yellow-400 tracking-[0.15em] mb-2">🏆 CAMPEÃO SIMULADO</div>
                <div className="text-4xl"><FlagIcon team={simResult.champion} size="xl" /></div>
                <div className="font-display text-base font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] mt-1">
                  {simResult.champion}
                </div>
              </div>
              {simResult.rounds.map((rd, ri) => (
                <div key={ri} className="mb-2">
                  <div className="text-[0.62rem] text-[hsl(25,100%,55%)] font-display tracking-[0.1em] mb-1">{rd.label}</div>
                  {rd.results.map((g, gi) => (
                    <div key={gi} className="flex items-center justify-between text-[0.75rem] py-0.5 border-b border-border/25">
                      <span className={g.w === g.h ? 'text-[hsl(150,100%,50%)]' : ''}>
                        <FlagIcon team={g.h} size="sm" /> {g.h}
                      </span>
                      <span className="text-muted-foreground text-[0.6rem]">vs</span>
                      <span className={g.w === g.a ? 'text-[hsl(150,100%,50%)]' : ''}>
                        {g.a} <FlagIcon team={g.a} size="sm" />
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monte Carlo */}
        <div className="bg-card border border-border p-4">
          <div className="font-display text-[0.7rem] text-primary tracking-[0.12em] mb-3">📊 MONTE CARLO — 1000 SIMULAÇÕES</div>
          <div className="text-[0.78rem] text-muted-foreground mb-3 leading-relaxed">
            Roda 1000 simulações e mostra quem ganha com mais frequência.
          </div>
          <button onClick={handleMonteCarlo}
            className="w-full font-display text-[0.58rem] font-bold border border-[hsl(150,100%,50%)] text-[hsl(150,100%,50%)] p-3 hover:bg-[hsl(150,100%,50%)]/10 transition-colors">
            📊 RODAR
          </button>
          {mcResult && (
            <div className="mt-3">
              <div className="text-[0.6rem] text-muted-foreground font-mono mb-2">RESULTADO DE 1000 SIMULAÇÕES</div>
              {mcResult.slice(0, 8).map((r, i) => (
                <div key={r.team} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-b-0">
                  <div className={`font-mono text-[0.72rem] min-w-[18px] text-right ${i === 0 ? 'text-yellow-400 font-bold' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                    {i + 1}
                  </div>
                  <FlagIcon team={r.team} size="sm" />
                  <span className="flex-1 font-semibold text-[0.78rem]">{r.team}</span>
                  <div className="flex-1 max-w-[70px] h-[3px] bg-white/5">
                    <div className="h-full bg-gradient-to-r from-[hsl(150,100%,50%)] to-primary transition-all" style={{ width: `${r.count / mcResult[0].count * 100}%` }} />
                  </div>
                  <span className="font-mono text-[0.75rem] text-primary min-w-[42px] text-right">{r.pct}%</span>
                </div>
              ))}
              <div className="text-[0.6rem] text-muted-foreground mt-2 font-mono">* % = vitórias em 1000 simulações Monte Carlo</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}