import { useState } from 'react';
import IAConfrontoPanel from './IAConfrontoPanel';
import IASelecaoPanel from './IASelecaoPanel';
import IARankSimPanel from './IARankSimPanel';

const subTabs = [
  { id: 'cf', icon: '⚡', label: 'PREVER CONFRONTO' },
  { id: 'sel', icon: '📋', label: 'ANÁLISE SELEÇÃO' },
  { id: 'rank', icon: '🏆', label: 'RANKING & SIMULAÇÃO' },
];

export default function IATab() {
  const [active, setActive] = useState('cf');

  return (
    <div>
      <div className="flex items-center gap-2 font-display text-sm text-primary tracking-[0.12em] uppercase mb-4 pb-2 border-b border-border">
        <div className="w-1 h-4 bg-primary shadow-[0_0_10px_hsl(190,100%,50%)]" />
        🤖 IA Analista — Previsão por Retrospecto
      </div>
      <div className="flex gap-1 mb-4 flex-wrap">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`
              px-3 py-1.5 font-display text-[0.6rem] font-bold tracking-[0.1em] cursor-pointer transition-all border
              ${active === t.id
                ? 'bg-primary/10 border-primary text-primary shadow-[0_0_16px_rgba(0,212,255,0.3)]'
                : 'bg-transparent border-border text-muted-foreground hover:border-primary hover:text-primary'
              }
            `}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {active === 'cf' && <IAConfrontoPanel />}
      {active === 'sel' && <IASelecaoPanel />}
      {active === 'rank' && <IARankSimPanel />}
    </div>
  );
}