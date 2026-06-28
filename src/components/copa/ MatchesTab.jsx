import { GROUP_MATCHES } from '@/lib/copaData';
import MatchCard from './MatchCard';

export default function MatchesTab() {
  return (
    <div>
      <div className="flex items-center gap-2 font-display text-sm text-primary tracking-[0.12em] uppercase mb-4 pb-2 border-b border-border">
        <div className="w-1 h-4 bg-primary shadow-[0_0_10px_hsl(190,100%,50%)]" />
        Tabela de Jogos — Fase de Grupos
      </div>
      {[1, 2, 3].map(round => {
        const matches = GROUP_MATCHES.filter(m => m.r === round);
        const byDate = {};
        matches.forEach(m => {
          if (!byDate[m.d]) byDate[m.d] = [];
          byDate[m.d].push(m);
        });

        return (
          <div key={round} className="mb-7">
            <div className="inline-block font-display text-[0.65rem] text-[hsl(25,100%,55%)] tracking-[0.15em] py-1 px-3 bg-[hsl(25,100%,55%)]/10 border-l-[3px] border-[hsl(25,100%,55%)] mb-3">
              ▶ {round}ª RODADA
            </div>
            {Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, ms]) => {
              const dd = new Date(date + 'T12:00:00');
              return (
                <div key={date} className="mb-4">
                  <div className="font-mono text-[0.68rem] text-primary py-1 border-b border-border mb-2">
                    📅 {dd.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {ms.map(m => (
                      <MatchCard key={m.id} match={m} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}