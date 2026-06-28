import { GRUPOS } from '@/lib/copaData';
import StatsRow from './StatsRow';
import GroupCard from './GroupCard';

export default function GroupsTab() {
  return (
    <div>
      <div className="flex items-center gap-2 font-display text-sm text-primary tracking-[0.12em] uppercase mb-4 pb-2 border-b border-border">
        <div className="w-1 h-4 bg-primary shadow-[0_0_10px_hsl(190,100%,50%)]" />
        Fase de Grupos — Copa do Mundo 2026
      </div>
      <StatsRow />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Object.keys(GRUPOS).map(g => (
          <GroupCard key={g} group={g} />
        ))}
      </div>
    </div>
  );
}