import { Trophy } from 'lucide-react';
import SaveLoadPanel from './SaveLoadPanel';

export default function Header() {
  return (
    <header className="py-6 px-5 border-b border-border bg-gradient-to-b from-[rgba(0,30,60,0.6)] to-transparent">
      <div className="flex items-center justify-center gap-4 mb-2">
        <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_gold]" />
        <h1 className="font-display text-3xl md:text-5xl font-black text-primary tracking-wider drop-shadow-[0_0_30px_rgba(0,212,255,0.4)]">
          COPA MUNDIAL 2026
        </h1>
        <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_gold]" />
      </div>
      <p className="font-mono text-xs text-muted-foreground tracking-[0.2em] text-center mb-4">
        SISTEMA DE ANÁLISE & PREVISÃO COM INTELIGÊNCIA ARTIFICIAL
      </p>
      <div className="flex justify-center">
        <SaveLoadPanel />
      </div>
    </header>
  );
}