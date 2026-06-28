import { useMemo } from 'react';
import { useCopa } from '@/lib/copaState';
import { iaProbs, iaScore } from '@/lib/copaEngine';
import FlagIcon from './FlagIcon';

export default function PredictionsTab() {
  const { grResults } = useCopa();

  const { sorted, maxP } = useMemo(() => {
    const probs = iaProbs(grResults);
    const s = Object.entries(probs).sort((a, b) => b[1] - a[1]);
    return { sorted: s, maxP: s[0]?.[1] || 1 };
  }, [grResults]);

  return (
    <div>
      <div className="flex items-center gap-2 font-display text-sm text-primary tracking-[0.12em] uppercase mb-4 pb-2 border-b border-border">
        <div className="w-1 h-4 bg-primary shadow-[0_0_10px_hsl(190,100%,50%)]" />
        Probabilidades — Motor de IA
      </div>
      <div className="bg-primary/5 border border-primary/15 p-2 text-[0.75rem] text-primary mb-4 font-mono">
        📡 Probabilidades calculadas com base em retrospecto histórico + ranking FIFA + forma atual na Copa.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.slice(0, 24).map(([t, p]) => {
            const ps = Math.min(p * 3.5, 85);
            const pq = Math.min(p * 6, 95);
            const po = Math.min(p * 10, 98);
            return (
              <div key={t} className="bg-card border border-border p-3">
                <div className="flex items-center gap-2 font-display text-[0.8rem] text-primary mb-2">
                  <FlagIcon team={t} size="md" />
                  {t}
                </div>
                <div className="text-[0.65rem] text-muted-foreground font-mono mb-2">
                  Score IA: {iaScore(t, grResults).toFixed(1)}
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: '🏆 Campeão', val: p, cls: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
                    { label: '⚔ Semifinal', val: ps, cls: 'bg-gradient-to-r from-primary to-blue-600' },
                    { label: '🔥 Quartas', val: pq, cls: 'bg-gradient-to-r from-[hsl(150,100%,50%)] to-green-500' },
                    { label: '▶ Oitavas', val: po, cls: 'bg-gradient-to-r from-gray-500 to-gray-700' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-2 text-[0.72rem]">
                      <span className="text-muted-foreground min-w-[78px] text-[0.68rem]">{row.label}</span>
                      <div className="flex-1 h-[5px] bg-white/5 rounded-sm overflow-hidden">
                        <div className={`h-full rounded-sm ${row.cls} transition-all duration-500`} style={{ width: `${row.val / maxP * 100}%` }} />
                      </div>
                      <span className="font-mono text-[0.68rem] text-primary min-w-[38px] text-right">
                        {row.val.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Top ranking */}
        <div>
          <div className="font-display text-[0.7rem] text-primary mb-2 tracking-[0.1em]">🏆 TOP FAVORITOS</div>
          <div className="bg-card border border-border p-3">
            {sorted.slice(0, 8).map(([t, p], i) => (
              <div key={t} className="flex items-center gap-2 py-2 border-b border-border/30 last:border-b-0 text-[0.82rem]">
                <div className={`font-mono text-[0.72rem] min-w-[18px] text-right ${i === 0 ? 'text-yellow-400 font-bold' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                  {i + 1}
                </div>
                <FlagIcon team={t} size="sm" />
                <span className="flex-1 font-semibold text-[0.82rem]">{t}</span>
                <div className="flex-1 max-w-[70px] h-[3px] bg-white/5">
                  <div className="h-full bg-gradient-to-r from-[hsl(150,100%,50%)] to-primary transition-all duration-500" style={{ width: `${p / maxP * 100}%` }} />
                </div>
                <span className="font-mono text-[0.75rem] text-primary min-w-[42px] text-right">
                  {p.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}