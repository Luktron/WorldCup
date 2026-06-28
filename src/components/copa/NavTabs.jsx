const tabs = [
  { id: 'grupos', icon: '⬡', label: 'GRUPOS' },
  { id: 'jogos', icon: '📅', label: 'JOGOS' },
  { id: 'matamata', icon: '⚔', label: 'MATA-MATA' },
  { id: 'previsao', icon: '📊', label: 'PREVISÃO' },
  { id: 'ia', icon: '🤖', label: 'IA ANALISTA' },
];

export default function NavTabs({ active, onChange }) {
  return (
    <nav className="flex justify-center gap-1 px-4 py-3 flex-wrap border-b border-border bg-background/90 sticky top-0 z-50 backdrop-blur-md">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{ clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}
          className={`
            px-4 py-2 font-display text-[0.6rem] font-bold tracking-[0.1em] cursor-pointer transition-all border
            ${active === t.id
              ? 'bg-primary/10 border-primary text-primary shadow-[0_0_16px_rgba(0,212,255,0.3)]'
              : 'bg-transparent border-border text-muted-foreground hover:border-primary hover:text-primary'
            }
          `}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </nav>
  );
}