import { GROUP_MATCHES } from '@/lib/copaData';
import { useCopa } from '@/lib/copaState';

export default function StatsRow() {
  const { grResults } = useCopa();
  
  let done = 0, gols = 0;
  GROUP_MATCHES.forEach(m => {
    const r = grResults[m.id];
    if (r) { done++; gols += r.hg + r.ag; }
  });

  const stats = [
    { n: done, l: 'Jogos realizados' },
    { n: GROUP_MATCHES.length - done, l: 'Jogos restantes' },
    { n: gols, l: 'Gols marcados' },
    { n: done > 0 ? (gols / done).toFixed(1) : '—', l: 'Média gols/jogo' },
    { n: 48, l: 'Seleções' },
    { n: 104, l: 'Jogos totais' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-5">
      {stats.map((s, i) => (
        <div key={i} className="bg-card border border-border p-3 text-center">
          <div className="font-display text-2xl font-black text-primary">{s.n}</div>
          <div className="text-[0.65rem] text-muted-foreground uppercase tracking-[0.1em] mt-1">{s.l}</div>
        </div>
      ))}
    </div>
  );
}