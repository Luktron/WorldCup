import { GRUPOS, GROUP_MATCHES } from '@/lib/copaData';
import { classif } from '@/lib/copaEngine';
import { useCopa } from '@/lib/copaState';
import FlagIcon from './FlagIcon';

export default function GroupCard({ group }) {
  const { grResults } = useCopa();
  const cl = classif(group, grResults);
  const jogosG = GROUP_MATCHES.filter(m => m.g === group);
  const doneG = jogosG.filter(m => grResults[m.id]).length;

  return (
    <div className="bg-card border border-border p-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="flex justify-between font-display text-[0.7rem] text-primary tracking-[0.15em] mb-2">
        <span>GRUPO {group}</span>
        <span className="text-muted-foreground text-[0.6rem]">{doneG}/{jogosG.length} jogos</span>
      </div>
      <table className="w-full text-[0.82rem] border-collapse">
        <thead>
          <tr>
            <th className="text-left text-muted-foreground text-[0.6rem] tracking-[0.1em] pb-1 border-b border-border">Seleção</th>
            <th className="text-right text-muted-foreground text-[0.6rem] tracking-[0.1em] pb-1 border-b border-border">J</th>
            <th className="text-right text-muted-foreground text-[0.6rem] tracking-[0.1em] pb-1 border-b border-border">V</th>
            <th className="text-right text-muted-foreground text-[0.6rem] tracking-[0.1em] pb-1 border-b border-border">E</th>
            <th className="text-right text-muted-foreground text-[0.6rem] tracking-[0.1em] pb-1 border-b border-border">D</th>
            <th className="text-right text-muted-foreground text-[0.6rem] tracking-[0.1em] pb-1 border-b border-border">SG</th>
            <th className="text-right text-primary text-[0.6rem] tracking-[0.1em] pb-1 border-b border-border font-bold">PTS</th>
          </tr>
        </thead>
        <tbody>
          {cl.map((t, i) => (
            <tr key={t.n} className={i < 2 ? 'text-[hsl(150,100%,50%)]' : i === 2 ? 'text-yellow-400' : ''}>
              <td className="py-1 pr-1 text-left border-b border-border/25">
                <div className="flex items-center gap-1.5">
                  <FlagIcon team={t.n} size="sm" />
                  <span className="truncate text-xs">{t.n}</span>
                </div>
              </td>
              <td className="py-1 text-right border-b border-border/25">{t.j}</td>
              <td className="py-1 text-right border-b border-border/25">{t.v}</td>
              <td className="py-1 text-right border-b border-border/25">{t.e}</td>
              <td className="py-1 text-right border-b border-border/25">{t.d}</td>
              <td className="py-1 text-right border-b border-border/25">{t.sg >= 0 ? '+' : ''}{t.sg}</td>
              <td className="py-1 text-right border-b border-border/25 text-primary font-bold font-mono">{t.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
