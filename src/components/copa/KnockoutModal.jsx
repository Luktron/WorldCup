import { useState } from 'react';
import { useCopa } from '@/lib/copaState';
import FlagIcon from './FlagIcon';

export default function KnockoutModal({ match, onClose }) {
  const { mmResults, saveKnockoutResult, clearKnockoutResult } = useCopa();
  const r = mmResults[match.id] || {};
  const [hg, setHg] = useState(r.hg || 0);
  const [ag, setAg] = useState(r.ag || 0);
  const [ph, setPh] = useState(r.ph || 0);
  const [pa, setPa] = useState(r.pa || 0);

  const handleSave = () => {
    saveKnockoutResult(match.id, parseInt(hg) || 0, parseInt(ag) || 0, parseInt(ph) || 0, parseInt(pa) || 0);
    onClose();
  };

  const handleClear = () => {
    clearKnockoutResult(match.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-background/90 z-[500] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-primary p-6 min-w-[300px] max-w-[95vw]">
        <div className="font-display text-primary text-[0.75rem] tracking-[0.1em] mb-4">
          REGISTRAR RESULTADO — {match.label || match.id.toUpperCase()}
        </div>
        <div className="flex items-center justify-center gap-3 mb-5 text-sm font-bold flex-wrap">
          <span className="flex items-center gap-1.5"><FlagIcon team={match.home} /> {match.home}</span>
          <input
            type="number" min="0" max="20" value={hg}
            onChange={e => setHg(e.target.value)}
            className="w-12 bg-secondary border border-primary text-primary font-display text-xl text-center p-1 outline-none"
          />
          <span className="text-muted-foreground">×</span>
          <input
            type="number" min="0" max="20" value={ag}
            onChange={e => setAg(e.target.value)}
            className="w-12 bg-secondary border border-primary text-primary font-display text-xl text-center p-1 outline-none"
          />
          <span className="flex items-center gap-1.5">{match.away} <FlagIcon team={match.away} /></span>
        </div>
        <div className="mb-4">
          <div className="text-[0.65rem] text-muted-foreground font-mono mb-2">SE EMPATE → PÊNALTIS:</div>
          <div className="flex items-center gap-2">
            <input
              type="number" min="0" max="20" value={ph} placeholder="0"
              onChange={e => setPh(e.target.value)}
              className="w-12 bg-secondary border border-border text-foreground text-center p-1 outline-none"
            />
            <span className="text-muted-foreground">×</span>
            <input
              type="number" min="0" max="20" value={pa} placeholder="0"
              onChange={e => setPa(e.target.value)}
              className="w-12 bg-secondary border border-border text-foreground text-center p-1 outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 font-display text-[0.58rem] font-bold border border-[hsl(150,100%,50%)] text-[hsl(150,100%,50%)] p-2.5 hover:bg-[hsl(150,100%,50%)]/10 transition-colors">
            ✓ SALVAR
          </button>
          <button onClick={handleClear} className="font-display text-[0.58rem] font-bold border border-destructive text-destructive px-3 p-2.5 hover:bg-destructive/10 transition-colors">
            ✕ LIMPAR
          </button>
          <button onClick={onClose} className="flex-1 font-display text-[0.58rem] font-bold border border-primary text-primary p-2.5 hover:bg-primary/10 transition-colors">
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
}