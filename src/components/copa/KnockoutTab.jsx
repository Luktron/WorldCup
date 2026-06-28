import { useState, useMemo } from 'react';
import { useCopa } from '@/lib/copaState';
import { buildFullBracket } from '@/lib/copaEngine';
import BracketMatch from './BracketMatch';
import KnockoutModal from './KnockoutModal';
import FlagIcon from './FlagIcon';

function BracketColumn({ matches, side, label, color, onClickMatch }) {
  return (
    <div className="flex flex-col w-[152px] flex-shrink-0">
      <div className={`font-display text-[0.56rem] tracking-[0.1em] text-center py-1 h-6 flex items-center justify-center whitespace-nowrap`} style={{ color }}>
        {label}
      </div>
      <div className="flex-1 flex flex-col justify-around py-0.5">
        {matches.map(m => (
          <BracketMatch key={m.id} match={m} side={side} onClickMatch={onClickMatch} />
        ))}
      </div>
    </div>
  );
}

export default function KnockoutTab() {
  const { grResults, mmResults } = useCopa();
  const [modal, setModal] = useState(null);

  const bracket = useMemo(() => buildFullBracket(grResults, mmResults), [grResults, mmResults]);

  const isTbd = t => !t || t === 'TBD' || (typeof t === 'string' && t.startsWith('3º'));
  const rfin = mmResults['fin'];
  const wfH = rfin && (rfin.hg > rfin.ag || (rfin.hg === rfin.ag && rfin.ph > rfin.pa));
  const wfA = rfin && (rfin.ag > rfin.hg || (rfin.hg === rfin.ag && rfin.pa > rfin.ph));

  const canClickFin = !isTbd(bracket.fin.home) && !isTbd(bracket.fin.away);

  return (
    <div>
      <div className="flex items-center gap-2 font-display text-sm text-primary tracking-[0.12em] uppercase mb-4 pb-2 border-b border-border">
        <div className="w-1 h-4 bg-primary shadow-[0_0_10px_hsl(190,100%,50%)]" />
        Fase Eliminatória
      </div>
      <div className="bg-[hsl(25,100%,55%)]/5 border border-[hsl(25,100%,55%)]/30 p-2 text-[0.75rem] text-[hsl(25,100%,55%)] mb-3 font-mono">
        ⚡ Confrontos definidos pela classificação dos grupos. Clique em qualquer partida para registrar o resultado.
      </div>

      {/* Bracket */}
      <div className="overflow-x-auto pb-3">
        <div className="flex items-stretch w-max mx-auto">
          {/* Left side */}
          <div className="flex items-stretch">
            <BracketColumn matches={bracket.r32.slice(0, 8)} side="left" label="ROUND OF 32" color="hsl(200,20%,40%)" onClickMatch={setModal} />
            <BracketColumn matches={bracket.r16.slice(0, 4)} side="left" label="OITAVAS" color="hsl(200,20%,50%)" onClickMatch={setModal} />
            <BracketColumn matches={bracket.qf.slice(0, 2)} side="left" label="QUARTAS" color="hsl(25,100%,55%)" onClickMatch={setModal} />
            <BracketColumn matches={bracket.sf.slice(0, 1)} side="left" label="SEMIFINAL" color="hsl(190,100%,50%)" onClickMatch={setModal} />
          </div>

          {/* Center - Final */}
          <div className="flex flex-col items-center justify-center min-w-[160px] pt-6">
            {/* Finalist left */}
            <div className="w-[152px]">
              <div
                className={`flex items-center gap-1 h-[34px] px-1.5 border border-border cursor-pointer transition-colors
                  ${wfH ? 'border-yellow-400 bg-yellow-400/5' : 'bg-background/95'}
                  ${canClickFin ? 'hover:bg-primary/5' : 'opacity-50 cursor-default'}
                `}
                onClick={() => canClickFin && setModal(bracket.fin)}
              >
                <span className="text-sm"><FlagIcon team={bracket.fin.home} /></span>
                <span className={`flex-1 text-[0.66rem] font-bold truncate ${wfH ? 'text-yellow-400' : ''}`}>
                  {isTbd(bracket.fin.home) ? 'A definir' : bracket.fin.home}
                </span>
                <span className={`font-display text-[0.68rem] font-black ${wfH ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                  {rfin ? rfin.hg : ''}
                </span>
              </div>
            </div>

            {/* Trophy */}
            <div className="text-center py-2 flex flex-col items-center justify-center min-h-[120px]">
              {bracket.champion ? (
                <>
                  <div className="text-3xl drop-shadow-[0_0_10px_gold]">🏆</div>
                  <div className="font-display text-[0.52rem] text-yellow-400 tracking-[0.1em] mt-1">CAMPEÃ</div>
                  <div className="text-2xl my-1"><FlagIcon team={bracket.champion} size="lg" /></div>
                  <div className="font-display text-[0.65rem] font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.7)] text-center">
                    {bracket.champion}
                  </div>
                  {rfin && (
                    <div className="font-display text-sm text-yellow-400 mt-1">{rfin.hg} × {rfin.ag}</div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-3xl opacity-30">🏆</div>
                  <div className="font-mono text-[0.6rem] text-muted-foreground mt-1.5">FINAL · 19 JUL</div>
                  <div className="font-mono text-[0.55rem] text-muted-foreground mt-0.5">MetLife, NJ</div>
                </>
              )}
            </div>

            {/* Finalist right */}
            <div className="w-[152px]">
              <div
                className={`flex items-center gap-1 h-[34px] px-1.5 border border-border cursor-pointer transition-colors
                  ${wfA ? 'border-yellow-400 bg-yellow-400/5' : 'bg-background/95'}
                  ${canClickFin ? 'hover:bg-primary/5' : 'opacity-50 cursor-default'}
                `}
                onClick={() => canClickFin && setModal(bracket.fin)}
              >
                <span className={`font-display text-[0.68rem] font-black ${wfA ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                  {rfin ? rfin.ag : ''}
                </span>
                <span className={`flex-1 text-[0.66rem] font-bold truncate text-right ${wfA ? 'text-yellow-400' : ''}`}>
                  {isTbd(bracket.fin.away) ? 'A definir' : bracket.fin.away}
                </span>
                <span className="text-sm"><FlagIcon team={bracket.fin.away} /></span>
              </div>
            </div>
          </div>

          {/* Right side (reversed) */}
          <div className="flex items-stretch flex-row-reverse">
            <BracketColumn matches={bracket.r32.slice(8, 16)} side="right" label="ROUND OF 32" color="hsl(200,20%,40%)" onClickMatch={setModal} />
            <BracketColumn matches={bracket.r16.slice(4, 8)} side="right" label="OITAVAS" color="hsl(200,20%,50%)" onClickMatch={setModal} />
            <BracketColumn matches={bracket.qf.slice(2, 4)} side="right" label="QUARTAS" color="hsl(25,100%,55%)" onClickMatch={setModal} />
            <BracketColumn matches={bracket.sf.slice(1, 2)} side="right" label="SEMIFINAL" color="hsl(190,100%,50%)" onClickMatch={setModal} />
          </div>
        </div>
      </div>

      {/* 3rd place match */}
      <div className="mt-4 max-w-md mx-auto">
        <div className="font-display text-[0.65rem] text-[hsl(25,100%,55%)] tracking-[0.15em] mb-2 text-center">
          DISPUTA 3º LUGAR
        </div>
        <BracketMatch match={bracket.third} side="left" onClickMatch={setModal} />
      </div>

      {modal && <KnockoutModal match={modal} onClose={() => setModal(null)} />}
    </div>
  );
}