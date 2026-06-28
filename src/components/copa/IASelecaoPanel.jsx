import { useState } from 'react';
import { getAllTeams, getHist, GROUP_MATCHES } from '@/lib/copaData';
import { iaScore } from '@/lib/copaEngine';
import { useCopa } from '@/lib/copaState';
import FlagIcon from './FlagIcon';

export default function IASelecaoPanel() {
  const { grResults } = useCopa();
  const teams = getAllTeams();
  const [team, setTeam] = useState('Brasil');
  const [analyzed, setAnalyzed] = useState(false);

  const analisar = () => setAnalyzed(true);

  const hh = getHist(team);
  const tot = hh.v + hh.e + hh.d || 1;
  const aprov = ((hh.v * 3 + hh.e) / (tot * 3) * 100).toFixed(1);
  const score = iaScore(team, grResults).toFixed(1);

  // Games in this cup
  const js = GROUP_MATCHES.filter(m => m.home === team || m.away === team);
  const rs = js.filter(m => grResults[m.id]);
  let pts = 0, gf = 0, gc = 0;
  const form = rs.map(m => {
    const r = grResults[m.id];
    const isH = m.home === team;
    const g = isH ? r.hg : r.ag, c = isH ? r.ag : r.hg;
    gf += g; gc += c;
    const res = g > c ? 'V' : g === c ? 'E' : 'D';
    if (res === 'V') pts += 3; else if (res === 'E') pts += 1;
    return { res, opp: isH ? m.away : m.home, g, c };
  });

  if (!analyzed) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3">
        <div className="bg-card border border-border p-4">
          <div className="font-display text-[0.7rem] text-primary tracking-[0.12em] mb-3">📋 ANÁLISE DE SELEÇÃO</div>
          <div className="flex gap-2 flex-wrap items-center">
            <select value={team} onChange={e => { setTeam(e.target.value); setAnalyzed(false); }}
              className="flex-1 min-w-[130px] bg-secondary border border-border text-foreground p-2 font-body text-sm outline-none">
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={analisar}
              className="font-display text-[0.58rem] font-bold border border-primary text-primary px-4 py-2.5 hover:bg-primary/10 transition-colors">
              📊 ANALISAR
            </button>
          </div>
        </div>
        <div className="bg-card border border-border p-4 text-center text-muted-foreground text-sm">
          Selecione e analise uma seleção
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3">
      <div className="bg-card border border-border p-4">
        <div className="font-display text-[0.7rem] text-primary tracking-[0.12em] mb-3">📋 ANÁLISE DE SELEÇÃO</div>
        <div className="flex gap-2 flex-wrap items-center mb-4">
          <select value={team} onChange={e => { setTeam(e.target.value); setAnalyzed(false); }}
            className="flex-1 min-w-[130px] bg-secondary border border-border text-foreground p-2 font-body text-sm outline-none">
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={analisar}
            className="font-display text-[0.58rem] font-bold border border-primary text-primary px-4 py-2.5 hover:bg-primary/10 transition-colors">
            📊 ANALISAR
          </button>
        </div>

        {/* Main analysis */}
        <div className="flex items-center gap-3 mb-4">
          <FlagIcon team={team} size="xl" />
          <div>
            <div className="font-display text-sm text-primary">{team}</div>
            <div className="text-[0.68rem] text-muted-foreground font-mono">Ranking #{hh.rank} · Score IA {score}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-black/30 p-2 text-center">
            <div className="font-display text-lg text-yellow-400">{hh.t}</div>
            <div className="text-[0.6rem] text-muted-foreground">TÍTULOS</div>
          </div>
          <div className="bg-black/30 p-2 text-center">
            <div className="font-display text-lg text-primary">{hh.c}</div>
            <div className="text-[0.6rem] text-muted-foreground">COPAS</div>
          </div>
          <div className="bg-black/30 p-2 text-center">
            <div className="font-display text-lg text-[hsl(150,100%,50%)]">{aprov}%</div>
            <div className="text-[0.6rem] text-muted-foreground">APROVEIT.</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center text-[0.75rem] mb-3">
          <div><div className="text-[hsl(150,100%,50%)] font-bold">{hh.v}</div><div className="text-muted-foreground text-xs">V</div></div>
          <div><div className="text-yellow-400 font-bold">{hh.e}</div><div className="text-muted-foreground text-xs">E</div></div>
          <div><div className="text-destructive font-bold">{hh.d}</div><div className="text-muted-foreground text-xs">D</div></div>
          <div><div className="font-bold">{hh.gf}-{hh.gc}</div><div className="text-muted-foreground text-xs">Gols</div></div>
        </div>

        <div className="space-y-1.5 mb-3">
          {[['Ataque', hh.at], ['Defesa', hh.def], ['Técnico', hh.tec], ['Experiência', hh.exp]].map(([l, v]) => (
            <div key={l} className="flex items-center gap-2 text-[0.72rem]">
              <span className="text-muted-foreground min-w-[80px] text-[0.65rem] uppercase">{l}</span>
              <div className="flex-1 h-[5px] bg-white/5 rounded-sm overflow-hidden">
                <div className="h-full rounded-sm bg-gradient-to-r from-[hsl(150,100%,50%)] to-primary transition-all" style={{ width: `${v}%` }} />
              </div>
              <span className="font-mono text-[0.68rem] text-primary min-w-[24px] text-right">{v}</span>
            </div>
          ))}
        </div>

        {rs.length > 0 ? (
          <div>
            <div className="text-[0.72rem] text-muted-foreground font-mono mb-1">COPA 2026 · {pts}pts · {gf}-{gc}</div>
            <div className="text-sm flex flex-wrap gap-1">
              {form.map((f, i) => (
                <span key={i} className={`${f.res === 'V' ? 'text-[hsl(150,100%,50%)]' : f.res === 'E' ? 'text-yellow-400' : 'text-destructive'}`}>
                  {f.res} {f.opp} ({f.g}×{f.c})
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[0.75rem] text-muted-foreground">Nenhuma partida registrada nesta Copa ainda.</div>
        )}
      </div>

      {/* Ficha */}
      <div className="bg-card border border-border p-4 self-start">
        <div className="font-display text-[0.7rem] text-primary tracking-[0.12em] mb-3">📖 FICHA TÉCNICA</div>
        <div className="text-center mb-3">
          <FlagIcon team={team} size="xl" />
          <div className="font-display text-[0.75rem] text-primary mt-1">{team}</div>
          <div className="text-[0.65rem] text-muted-foreground font-mono">FIFA #{hh.rank} · Score {score}</div>
        </div>
        {[
          ['🏆 Títulos', hh.t, 'text-yellow-400'],
          ['🥈 Finais', hh.f, ''],
          ['🏅 Semis', hh.s, ''],
          ['📅 Copas', hh.c, ''],
          ['✅ Vitórias', hh.v, 'text-[hsl(150,100%,50%)]'],
          ['➖ Empates', hh.e, 'text-yellow-400'],
          ['❌ Derrotas', hh.d, 'text-destructive'],
          ['⚽ Gols F.', hh.gf, ''],
          ['🥅 Gols S.', hh.gc, ''],
        ].map(([l, v, c]) => (
          <div key={l} className="flex justify-between py-1 border-b border-border/25 text-[0.78rem]">
            <span className="text-muted-foreground">{l}</span>
            <span className={`font-bold ${c}`}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}