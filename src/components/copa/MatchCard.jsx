import { useState } from 'react';
import { useCopa } from '@/lib/copaState';
import { probMatch } from '@/lib/copaEngine';
import FlagIcon from './FlagIcon';

export default function MatchCard({ match }) {
  const { grResults, saveGroupResult, clearGroupResult } = useCopa();
  const r = grResults[match.id];
  const [showInput, setShowInput] = useState(false);
  const [hg, setHg] = useState(r ? r.hg : 0);
  const [ag, setAg] = useState(r ? r.ag : 0);
  const [showProb, setShowProb] = useState(false);
  const prob = showProb ? probMatch(match.home, match.away, grResults) : null;

  const handleSave = () => {
    saveGroupResult(match.id, parseInt(hg) || 0, parseInt(ag) || 0);
    setShowInput(false);
  };

  return (
    <div className={`bg-card border border-border p-2.5 transition-colors hover:border-primary ${r ? 'border-l-2 border-l-[hsl(150,100%,50%)]' : ''}`}>
      <div className="flex justify-between font-mono text-[0.6rem] text-muted-foreground mb-2">
        <span>GRP {match.g} · {match.loc}</span>
        <span>{match.d.split('-').reverse().join('/')} {match.h}</span>
      </div>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <FlagIcon team={match.home} size="md" />
          <span className="text-sm font-bold truncate">{match.home}</span>
        </div>
        <div className="font-display font-black text-lg text-primary flex items-center gap-1 px-2">
          {r ? (
            <>
              <span>{r.hg}</span>
              <span className="text-muted-foreground text-[0.7rem]">×</span>
              <span>{r.ag}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-xs font-mono">VS</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-row-reverse">
          <FlagIcon team={match.away} size="md" />
          <span className="text-sm font-bold truncate text-right">{match.away}</span>
        </div>
      </div>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        <button
          onClick={() => { setShowInput(!showInput); setHg(r ? r.hg : 0); setAg(r ? r.ag : 0); }}
          className="font-display text-[0.58rem] font-bold tracking-[0.08em] border border-primary text-primary px-2.5 py-1 hover:bg-primary/10 transition-colors"
        >
          {r ? '✏ EDITAR' : '+ RESULTADO'}
        </button>
        <button
          onClick={() => setShowProb(!showProb)}
          className={`font-display text-[0.58rem] font-bold tracking-[0.08em] border px-2.5 py-1 transition-colors ${showProb ? 'border-[hsl(150,100%,50%)] text-[hsl(150,100%,50%)] bg-[hsl(150,100%,50%)]/10' : 'border-[hsl(25,100%,55%)] text-[hsl(25,100%,55%)] hover:bg-[hsl(25,100%,55%)]/10'}`}
        >
          📊 PROB
        </button>
        {r && (
          <button
            onClick={() => clearGroupResult(match.id)}
            className="font-display text-[0.58rem] font-bold tracking-[0.08em] border border-destructive text-destructive px-2 py-1 hover:bg-destructive/10 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
      {showProb && prob && (
        <div className="mt-2 text-[0.65rem] font-mono">
          <div className="flex h-[5px] mb-1 overflow-hidden">
            <div className="bg-[hsl(150,100%,50%)]" style={{ width: `${prob.home}%` }} />
            <div className="bg-gray-600" style={{ width: `${prob.draw}%` }} />
            <div className="bg-primary flex-1" />
          </div>
          <div className="flex justify-between text-[0.6rem]">
            <span className="text-[hsl(150,100%,50%)]">{prob.home}%</span>
            <span className="text-muted-foreground">{prob.draw}% E</span>
            <span className="text-primary">{prob.away}%</span>
          </div>
        </div>
      )}
      {showInput && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <input
            type="number" min="0" max="20" value={hg}
            onChange={e => setHg(e.target.value)}
            className="w-10 bg-secondary border border-primary text-primary font-display text-center p-1 text-sm outline-none"
          />
          <span className="text-muted-foreground text-xs">×</span>
          <input
            type="number" min="0" max="20" value={ag}
            onChange={e => setAg(e.target.value)}
            className="w-10 bg-secondary border border-primary text-primary font-display text-center p-1 text-sm outline-none"
          />
          <button
            onClick={handleSave}
            className="font-display text-[0.58rem] font-bold border border-[hsl(150,100%,50%)] text-[hsl(150,100%,50%)] px-2.5 py-1 hover:bg-[hsl(150,100%,50%)]/10 transition-colors"
          >
            ✓ SALVAR
          </button>
        </div>
      )}
    </div>
  );
}