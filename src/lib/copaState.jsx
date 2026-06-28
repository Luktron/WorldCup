import { createContext, useContext, useState, useCallback } from 'react';

const CopaContext = createContext(null);

export function CopaProvider({ children }) {
  const [grResults, setGrResults] = useState(() => {
    const saved = localStorage.getItem('c26_gr');
    return saved ? JSON.parse(saved) : {};
  });

  const [mmResults, setMmResults] = useState(() => {
    const saved = localStorage.getItem('c26_mm');
    return saved ? JSON.parse(saved) : {};
  });

  const saveGroupResult = useCallback((id, hg, ag) => {
    setGrResults(prev => {
      const next = { ...prev, [id]: { hg, ag } };
      localStorage.setItem('c26_gr', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearGroupResult = useCallback((id) => {
    setGrResults(prev => {
      const next = { ...prev };
      delete next[id];
      localStorage.setItem('c26_gr', JSON.stringify(next));
      return next;
    });
  }, []);

  const saveKnockoutResult = useCallback((id, hg, ag, ph = 0, pa = 0) => {
    setMmResults(prev => {
      const next = { ...prev, [id]: { hg, ag, ph, pa } };
      localStorage.setItem('c26_mm', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearKnockoutResult = useCallback((id) => {
    setMmResults(prev => {
      const next = { ...prev };
      delete next[id];
      localStorage.setItem('c26_mm', JSON.stringify(next));
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setGrResults({});
    setMmResults({});
    localStorage.removeItem('c26_gr');
    localStorage.removeItem('c26_mm');
  }, []);

  return (
    <CopaContext.Provider value={{
      grResults, mmResults,
      saveGroupResult, clearGroupResult,
      saveKnockoutResult, clearKnockoutResult,
      resetAll,
    }}>
      {children}
    </CopaContext.Provider>
  );
}

export function useCopa() {
  const ctx = useContext(CopaContext);
  if (!ctx) throw new Error('useCopa must be used inside CopaProvider');
  return ctx;
}