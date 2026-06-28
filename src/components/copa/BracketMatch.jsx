// @ts-nocheck
import { useCopa } from '@/lib/copaState';
import FlagIcon from './FlagIcon';

function isTbd(t) {
  return !t || t === 'TBD' || (typeof t === 'string' && t.startsWith('3º'));
}

function shortName(t) {
  if (isTbd(t)) return 'A definir';
  return t.length > 14 ? t.slice(0, 13) + '…' : t;
}

export default function BracketMatch({ match, side = 'left', onClickMatch }) {
  const { mmResults } = useCopa();
  const r = mmResults[match.id];
  
  const winH = r && (r.hg > r.ag || (r.hg === r.ag && r.ph > r.pa));
  const winA = r && (r.ag > r.hg || (r.hg === r.ag && r.pa > r.ph));

  const canClick = !isTbd(match.home) && !isTbd(match.away);

  const TeamRow = ({ team, isWin, isHome }) => {
    const sc = r ? (isHome ? r.hg : r.ag) : null;
    const tbd = isTbd(team);
    
    return (
      <div
        className={`
          flex items-center gap-1 h-[30px] px-1.5 bg-background/95 border border-border cursor-pointer transition-colors text-[0.66rem]
          ${isWin ? 'bg-[hsl(150,100%,50%)]/10 border-[hsl(150,100%,50%)]' : ''}
          ${tbd ? 'opacity-50 cursor-default' : 'hover:bg-primary/5'}
          ${!isHome ? 'border-t-0' : ''}
        `}
        onClick={() => canClick && onClickMatch(match)}
      >
        {side === 'left' ? (
          <>
            <span className="text-sm flex-shrink-0">{tbd ? '🏳' : <FlagIcon team={team} size="sm" />}</span>
            <span className={`flex-1 font-bold truncate ${isWin ? 'text-[hsl(150,100%,50%)]' : ''}`}>{shortName(team)}</span>
            <span className={`font-display text-[0.68rem] font-black min-w-[13px] text-center ${isWin ? 'text-[hsl(150,100%,50%)]' : 'text-muted-foreground'}`}>
              {sc !== null ? sc : ''}
            </span>
          </>
        ) : (
          <>
            <span className={`font-display text-[0.68rem] font-black min-w-[13px] text-center ${isWin ? 'text-[hsl(150,100%,50%)]' : 'text-muted-foreground'}`}>
              {sc !== null ? sc : ''}
            </span>
            <span className={`flex-1 font-bold truncate text-right ${isWin ? 'text-[hsl(150,100%,50%)]' : ''}`}>{shortName(team)}</span>
            <span className="text-sm flex-shrink-0">{tbd ? '🏳' : <FlagIcon team={team} size="sm" />}</span>
          </>
        )}
      </div>
    );
  };

  const matchDateLabel = match.time ? `${match.date} às ${match.time}` : match.date;

  return (
    <div className="my-1">
      <div className="font-mono text-[0.5rem] text-muted-foreground px-1 truncate">
        {match.label} · {matchDateLabel} {match.loc ? `· ${match.loc}` : ''}
      </div>
      <TeamRow team={match.home} isWin={winH} isHome={true} />
      <TeamRow team={match.away} isWin={winA} isHome={false} />
      {r && r.hg === r.ag && (r.ph || r.pa) ? (
        <div className="font-mono text-[0.5rem] text-muted-foreground text-center py-0.5">
          Pên: {r.ph || 0}×{r.pa || 0}
        </div>
      ) : null}
    </div>
  );
}