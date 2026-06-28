import { useRef } from 'react';
import { useCopa } from '@/lib/copaState';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function SaveLoadPanel() {
  const { grResults, mmResults, saveGroupResult, saveKnockoutResult, resetAll } = useCopa();
  const fileRef = useRef(null);

  const handleExport = () => {
    const data = { grResults, mmResults, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copa2026_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso!');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = JSON.parse(ev.target.result);
      if (!data.grResults || !data.mmResults) {
        toast.error('Arquivo inválido!');
        return;
      }
      resetAll();
      Object.entries(data.grResults).forEach(([id, r]) => saveGroupResult(id, r.hg, r.ag));
      Object.entries(data.mmResults).forEach(([id, r]) => saveKnockoutResult(id, r.hg, r.ag, r.ph, r.pa));
      toast.success('Dados importados com sucesso!');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Apagar todos os resultados? Esta ação não pode ser desfeita.')) {
      resetAll();
      toast.success('Todos os dados foram apagados.');
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-mono text-[0.6rem] text-muted-foreground">DADOS:</span>

      <button
        onClick={handleExport}
        className="flex items-center gap-1 font-display text-[0.58rem] font-bold tracking-[0.08em] border border-[hsl(150,100%,50%)] text-[hsl(150,100%,50%)] px-2.5 py-1 hover:bg-[hsl(150,100%,50%)]/10 transition-colors"
      >
        <Download className="w-3 h-3" />
        EXPORTAR
      </button>

      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1 font-display text-[0.58rem] font-bold tracking-[0.08em] border border-primary text-primary px-2.5 py-1 hover:bg-primary/10 transition-colors"
      >
        <Upload className="w-3 h-3" />
        IMPORTAR
      </button>

      <button
        onClick={handleReset}
        className="flex items-center gap-1 font-display text-[0.58rem] font-bold tracking-[0.08em] border border-destructive text-destructive px-2.5 py-1 hover:bg-destructive/10 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        RESETAR
      </button>

      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </div>
  );
}