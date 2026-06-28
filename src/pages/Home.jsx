import { useState } from 'react';
import { CopaProvider } from '@/lib/copaState';
import Header from '@/components/copa/Header';
import NavTabs from '@/components/copa/NavTabs';
import GroupsTab from '@/components/copa/GroupsTab';
import MatchesTab from '@/components/copa/MatchesTab';
import KnockoutTab from '@/components/copa/KnockoutTab';
import PredictionsTab from '@/components/copa/PredictionsTab';
import IATab from '@/components/copa/IATab';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [activeTab, setActiveTab] = useState('grupos');

  return (
    <CopaProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <NavTabs active={activeTab} onChange={setActiveTab} />
        <main className="max-w-[1400px] mx-auto px-3 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'grupos' && <GroupsTab />}
              {activeTab === 'jogos' && <MatchesTab />}
              {activeTab === 'matamata' && <KnockoutTab />}
              {activeTab === 'previsao' && <PredictionsTab />}
              {activeTab === 'ia' && <IATab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </CopaProvider>
  );
}