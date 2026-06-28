import { useState } from 'react';
import { getAllTeams, getHist, GROUP_MATCHES } from '@/lib/copaData';
import { probMatch, placarProv, iaScore } from '@/lib/copaEngine';
import { useCopa } from '@/lib/copaState';
import FlagIcon from './FlagIcon';

function buildNarrativa(tA, tB, hA, hB, prob, pl, apA, apB, favH, grResults) {
  const fav = favH ? tA : tB;
  const probFav = favH ? prob.home : prob.away;
  const parts = [];
  const pf = parseFloat(probFav);

  if (pf >= 65) parts.push({ text: `${fav} entra como grande favorito com ${probFav}% de probabilidade de vitória.`, fav: fav });
  else if (pf >= 52) parts.push({ text: `Confronto equilibrado. ${fav} é levemente favorito (${probFav}%), mas qualquer resultado é possível.`, fav: fav });
  else parts.push({ text: `A IA classifica esse confronto como praticamente 50/50. Nível muito similar entre as equipes.` });

  if (hA.t > 0 || hB.t > 0) {
    if (hA.t > 0 && hB.t > 0) parts.push({ text: `Duelo histórico: ${tA} tem ${hA.t} título(s) e ${tB} tem ${hB.t} título(s) mundiais.` });
    else { const tt = hA.t > 0 ? tA : tB, nt = hA.t > 0 ? hA.t : hB.t; parts.push({ text: `${tt} carrega a história de ${nt} título(s) mundiais.` }); }
  }

  parts.push({ text: `Aproveitamento em Copas: ${tA} (${apA}%) vs ${tB} (${apB}%).` });
  if (hA.at > hB.def + 10) parts.push({ text: `O ataque de ${tA} (${hA.at}/100) pode superar a defesa de ${tB} (${hB.def}/100).` });
  if (hB.at > hA.def + 10) parts.push({ text: `${tB} tem poder ofensivo (${hB.at}/100) para ameaçar ${tA} (defesa: ${hA.def}/100).` });

  const rkFav = hA.rank < hB.rank ? tA : tB;
  const rkN = hA.rank < hB.rank ? hA.rank : hB.rank;
  parts.push({ text: `No ranking FIFA, ${rkFav} está melhor posicionado (#${rkN}).` });

  parts.push({ text: `Placar previsto: ${pl.gh} × ${pl.ga} — baseado na média de gols e poder ofensivo/defensivo.` });
  return parts;
}

export default function IAConfrontoPanel() {
  const { grResults } = useCopa();
  const teams = getAllTeams();
  const [teamA, setTeamA] = useState('Brasil');
  const [teamB, setTeamB] = useState('Argentina');
  const [result, setResult] = useState(null);

  const prever = () => {
    if (!teamA || !teamB || teamA === teamB) return;
    const prob = probMatch(teamA, teamB, grResults);
    const pl = placarProv(teamA, teamB);
    const hA = getHist(teamA), hB = getHist(teamB);
    const sA = iaScore(teamA, grResults).toFixed(1);
    const sB = iaScore(teamB, grResults).toFixed(1);
    const favH = parseFloat(prob.home) > parseFloat(prob.away);
    const totA = hA.v + hA.e + hA.d || 1, totB = hB.v + hB.e + hB.d || 1;
    const apA = ((hA.v * 3 + hA.e) / (totA * 3) * 100).toFixed(1);
    const apB = ((hB.v * 3 + hB.e) / (totB * 3) * 100).toFixed(1);
    const narrativa = buildNarrativa(teamA, teamB, hA, hB, prob, pl, apA, apB, favH, grResults);

    const cmpRows = [
      ['OFENSIVO', hA.at, hB.at], ['DEFENSIVO', hA.def, hB.def], ['TÉCNICO', hA.tec, hB.tec],
      ['EXP.', hA.exp, hB.exp], ['TÍTULOS', hA.t, hB.t], ['APROVEIT.', apA + '%', apB + '%'],
      ['FIFA', `#${hA.rank}`, `#${hB.rank}`], ['SCORE IA', sA, sB],
    ];

    setResult({ prob, pl, favH, cmpRows, narrativa });
  };

  return (
    <div className="bg-card border border-border p-4">
      <div className="font-display text-[0.7rem] text-primary tracking-[0.12em] mb-3">⚡ PREVER CONFRONTO</div>
      <div className="text-[0.72rem] text-muted-foreground font-mono mb-3">
        A IA analisa títulos, aproveitamento em Copas, ranking FIFA, poder ofensivo/defensivo e forma atual.
      </div>
      <div className="flex gap-2 flex-wrap items-center mb-4">
        <select value={teamA} onChange={e => setTeamA(e.target.value)}
          className="flex-1 min-w-[130px] bg-secondary border border-border text-foreground p-2 font-body text-sm outline-none">
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="text-[hsl(25,100%,55%)] font-display text-sm font-bold">VS</div>
        <select value={teamB} onChange={e => setTeamB(e.target.value)}
          className="flex-1 min-w-[130px] bg-secondary border border-border text-foreground p-2 font-body text-sm outline-none">
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={prever}
          className="font-display text-[0.58rem] font-bold border border-[hsl(150,100%,50%)] text-[hsl(150,100%,50%)] px-5 py-2.5 hover:bg-[hsl(150,100%,50%)]/10 transition-colors">
          🔮 PREVER
        </button>
      </div>

      {result && (
        <div className="mt-4">
          {/* Confronto header */}
          <div className="flex border border-border mb-3 overflow-hidden flex-col sm:flex-row">
            <div className={`flex-1 p-4 text-center ${result.favH ? 'bg-[hsl(150,100%,50%)]/5' : ''}`}>
              <div className="text-3xl"><FlagIcon team={teamA} size="xl" /></div>
              <div className={`font-display text-[0.7rem] mt-1 ${result.favH ? 'text-[hsl(150,100%,50%)]' : ''}`}>{teamA}</div>
              <div className="font-mono text-xl text-primary font-bold mt-1">{result.prob.home}%</div>
              <div className="text-[0.6rem] text-muted-foreground">chance de vitória</div>
              {result.favH && <div className="mt-1.5 text-[0.62rem] px-2 py-0.5 bg-[hsl(150,100%,50%)]/15 text-[hsl(150,100%,50%)] inline-block">FAVORITO</div>}
            </div>
            <div className="flex flex-col items-center justify-center px-4 py-3 bg-black/30">
              <div className="text-[0.6rem] text-muted-foreground font-mono">EMPATE</div>
              <div className="font-display text-base text-muted-foreground">{result.prob.draw}%</div>
            </div>
            <div className={`flex-1 p-4 text-center ${!result.favH ? 'bg-[hsl(150,100%,50%)]/5' : ''}`}>
              <div className="text-3xl"><FlagIcon team={teamB} size="xl" /></div>
              <div className={`font-display text-[0.7rem] mt-1 ${!result.favH ? 'text-[hsl(150,100%,50%)]' : ''}`}>{teamB}</div>
              <div className="font-mono text-xl text-primary font-bold mt-1">{result.prob.away}%</div>
              <div className="text-[0.6rem] text-muted-foreground">chance de vitória</div>
              {!result.favH && <div className="mt-1.5 text-[0.62rem] px-2 py-0.5 bg-[hsl(150,100%,50%)]/15 text-[hsl(150,100%,50%)] inline-block">FAVORITO</div>}
            </div>
          </div>

          {/* Prob bar */}
          <div className="h-2 bg-white/5 mb-3 flex overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[hsl(150,100%,50%)] to-primary transition-all" style={{ width: `${result.prob.home}%` }} />
            <div className="h-full bg-gray-600/40" style={{ width: `${result.prob.draw}%` }} />
            <div className="h-full bg-gradient-to-r from-primary to-blue-600 flex-1" />
          </div>

          {/* Score */}
          <div className="text-center p-3 bg-primary/5 border border-primary/15 mb-3">
            <div className="text-[0.6rem] text-muted-foreground font-mono tracking-[0.12em] mb-1.5">PLACAR MAIS PROVÁVEL</div>
            <div className="font-display text-3xl font-black text-primary">{result.pl.gh} — {result.pl.ga}</div>
            <div className="text-[0.62rem] text-muted-foreground font-mono mt-1">
              Gols esperados: {result.pl.eA} ({teamA.split(' ')[0]}) × {result.pl.eB} ({teamB.split(' ')[0]})
            </div>
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-3 gap-1 mb-3 text-[0.75rem]">
            {result.cmpRows.map(([lbl, vA, vB]) => {
              const nA = parseFloat(vA), nB = parseFloat(vB);
              const wA = nA >= nB, wB = nB > nA;
              return (
                <div key={lbl} className="contents">
                  <div className={`p-1.5 bg-black/20 text-right ${wA ? 'text-[hsl(150,100%,50%)]' : ''}`}>
                    {vA}{wA ? ' ◀' : ''}
                  </div>
                  <div className="p-1.5 bg-black/30 text-center text-muted-foreground text-[0.6rem] font-mono whitespace-nowrap">{lbl}</div>
                  <div className={`p-1.5 bg-black/20 ${wB ? 'text-[hsl(150,100%,50%)]' : ''}`}>
                    {wB ? '▶ ' : ''}{vB}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Narrativa */}
          <div className="bg-black/20 border-l-[3px] border-[hsl(25,100%,55%)] p-3 text-[0.82rem] leading-relaxed">
            <div className="font-mono text-[0.6rem] text-[hsl(25,100%,55%)] tracking-[0.1em] mb-2">🤖 ANÁLISE DA IA</div>
            {result.narrativa.map((p, i) => (
              <p key={i} className="mb-1.5">{p.text}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}