// @ts-nocheck
import { GRUPOS, GROUP_MATCHES, getHist } from './copaData';

// IA Score computation
export function iaScore(team, grResults) {
  const hh = getHist(team);
  const tot = hh.v + hh.e + hh.d || 1;
  const aprov = (hh.v * 3 + hh.e) / (tot * 3);
  const saldo = (hh.gf - hh.gc) / (tot || 1);
  const rank = Math.max(0, (100 - hh.rank) / 100);
  let sc = hh.t * 12 + hh.f * 5 + hh.s * 3 + hh.c * 0.8 + aprov * 30 + saldo * 8 + hh.at * 0.25 + hh.def * 0.25 + hh.tec * 0.3 + hh.exp * 0.12 + rank * 20;
  
  GROUP_MATCHES.filter(m => m.home === team || m.away === team).forEach(m => {
    const r = grResults[m.id];
    if (!r) return;
    const isH = m.home === team;
    const gf = isH ? r.hg : r.ag;
    const gc = isH ? r.ag : r.hg;
    sc += gf > gc ? 5 : gf === gc ? 2 : -1;
    sc += (gf - gc) * 0.5;
  });
  return Math.max(sc, 0.1);
}

export function iaProbs(grResults) {
  const all = Object.values(GRUPOS).flat();
  const sc = {};
  all.forEach(t => { sc[t] = iaScore(t, grResults); });
  const tot = Object.values(sc).reduce((a, b) => a + b, 0);
  const p = {};
  Object.keys(sc).forEach(t => { p[t] = sc[t] / tot * 100; });
  return p;
}

export function probMatch(tA, tB, grResults) {
  const sA = iaScore(tA, grResults);
  const sB = iaScore(tB, grResults);
  const tot = sA + sB;
  const pH = sA / tot;
  const pA = sB / tot;
  const diff = Math.abs(pH - pA);
  const draw = Math.max(0.05, 0.28 - diff * 0.3);
  const rem = 1 - draw;
  return {
    home: (pH * rem / (pH + pA) * 100).toFixed(1),
    draw: (draw * 100).toFixed(1),
    away: (pA * rem / (pH + pA) * 100).toFixed(1),
  };
}

export function placarProv(tA, tB) {
  const hA = getHist(tA);
  const hB = getHist(tB);
  const totA = hA.v + hA.e + hA.d || 1;
  const totB = hB.v + hB.e + hB.d || 1;
  const mgA = hA.gf / totA;
  const mgB = hB.gf / totB;
  const dA = hA.def / 100;
  const dB = hB.def / 100;
  const eA = Math.max(0.3, mgA * (1 - dB * 0.5));
  const eB = Math.max(0.3, mgB * (1 - dA * 0.5));
  return { gh: Math.round(eA), ga: Math.round(eB), eA: eA.toFixed(2), eB: eB.toFixed(2) };
}

// Group standings
export function classif(grp, grResults) {
  const ts = GRUPOS[grp].map(t => ({ n: t, pts: 0, j: 0, v: 0, e: 0, d: 0, gf: 0, gc: 0, sg: 0 }));
  const gt = n => ts.find(t => t.n === n);
  GROUP_MATCHES.filter(m => m.g === grp).forEach(m => {
    const r = grResults[m.id];
    if (!r) return;
    const H = gt(m.home);
    const A = gt(m.away);
    if (!H || !A) return;
    H.j++; A.j++;
    H.gf += r.hg; H.gc += r.ag; H.sg += r.hg - r.ag;
    A.gf += r.ag; A.gc += r.hg; A.sg += r.ag - r.hg;
    if (r.hg > r.ag) { H.v++; H.pts += 3; A.d++; }
    else if (r.hg === r.ag) { H.e++; H.pts++; A.e++; A.pts++; }
    else { A.v++; A.pts += 3; H.d++; }
  });
  return ts.sort((a, b) => b.pts - a.pts || b.sg - a.sg || b.gf - a.gf);
}

export function grp1st(g, grResults) { return classif(g, grResults)[0]?.n || 'TBD'; }
export function grp2nd(g, grResults) { return classif(g, grResults)[1]?.n || 'TBD'; }
export function grp3rd(g, grResults) { return classif(g, grResults)[2]?.n || 'TBD'; }

// Best 3rd-place teams (8 best 3rd from 12 groups)
export function getBestThirds(grResults) {
  const thirds = Object.keys(GRUPOS).map(g => {
    const standings = classif(g, grResults);
    const team = standings[2];
    return { ...team, group: g };
  });
  return thirds.sort((a, b) => b.pts - a.pts || b.sg - a.sg || b.gf - a.gf).slice(0, 8);
}

// Knockout bracket builder - fixed bracket structure based on the custom mata-mata configuration
export function getKnockoutBracket(grResults) {
  const bestThirds = getBestThirds(grResults);

  // Slots that receive best 3rd-place teams and the groups they can come from
  const thirdSlots = {
    r32_01: ['A','B','C','D','F'],
    r32_02: ['C','D','F','G','H'],
    r32_07: ['B','E','F','I','J'],
    r32_08: ['A','E','H','I','J'],
    r32_11: ['C','E','F','H','I'],
    r32_12: ['E','H','I','J','K'],
    r32_15: ['E','F','G','I','J'],
    r32_16: ['D','E','I','J','L'],
  };

  // Copa 2026 official FIFA 3rd-place assignment table.
  // Key = sorted qualifying groups joined by comma.
  // Value = group → slot mapping predetermined by FIFA before the tournament.
  const FIFA_TABLE = {
    'B,D,E,F,I,J,K,L': { B:'r32_07', D:'r32_01', E:'r32_11', F:'r32_02', I:'r32_08', J:'r32_15', K:'r32_12', L:'r32_16' },
    'A,B,C,D,E,F,G,H': { A:'r32_08', B:'r32_07', C:'r32_01', D:'r32_02', E:'r32_11', F:'r32_15', G:'r32_16', H:'r32_12' },
    'A,B,C,D,E,F,G,I': { A:'r32_08', B:'r32_07', C:'r32_01', D:'r32_02', E:'r32_11', F:'r32_15', G:'r32_16', I:'r32_12' },
  };

  const qualifyingGroups = bestThirds.map(t => t.group).sort().join(',');
  const officialMap = FIFA_TABLE[qualifyingGroups];

  let thirdTeam = {};

  if (officialMap) {
    // Use FIFA's predetermined assignment for this combination
    for (const team of bestThirds) {
      const slot = officialMap[team.group];
      if (slot) thirdTeam[slot] = team.n;
    }
  } else {
    // Fallback: most-constrained-first greedy algorithm.
    // At each step pick the slot with fewest remaining valid candidates,
    // then assign the best-ranked available team. Eliminates duplicates and
    // minimises wrong assignments when groups overlap across slots.
    const remaining = [...bestThirds];
    const pending = new Set(Object.keys(thirdSlots));

    while (pending.size > 0) {
      let chosenSlot = null;
      let minCount = Infinity;
      for (const slotId of pending) {
        const count = remaining.filter(t => thirdSlots[slotId].includes(t.group)).length;
        if (count < minCount) { minCount = count; chosenSlot = slotId; }
      }
      pending.delete(chosenSlot);
      const candidates = remaining.filter(t => thirdSlots[chosenSlot].includes(t.group));
      if (candidates.length > 0) {
        thirdTeam[chosenSlot] = candidates[0].n;
        remaining.splice(remaining.findIndex(t => t.n === candidates[0].n), 1);
      } else {
        thirdTeam[chosenSlot] = 'TBD';
      }
    }
  }

  const t = id => thirdTeam[id] || 'TBD';

  const r32 = [
    { id: 'r32_01', label: 'Jogo 1',  home: grp1st('E', grResults), away: t('r32_01'), date: '29/06', time: '17:30', loc: '' },
    { id: 'r32_02', label: 'Jogo 2',  home: grp1st('I', grResults), away: t('r32_02'), date: '30/06', time: '18:00', loc: '' },
    { id: 'r32_03', label: 'Jogo 3',  home: grp2nd('A', grResults), away: grp2nd('B', grResults),    date: '28/06', time: '16:00', loc: '' },
    { id: 'r32_04', label: 'Jogo 4',  home: grp1st('F', grResults), away: grp2nd('C', grResults),    date: '29/06', time: '22:00', loc: '' },
    { id: 'r32_05', label: 'Jogo 5',  home: grp2nd('K', grResults), away: grp2nd('L', grResults),    date: '02/07', time: '20:00', loc: '' },
    { id: 'r32_06', label: 'Jogo 6',  home: grp1st('H', grResults), away: grp2nd('J', grResults),    date: '02/07', time: '16:00', loc: '' },
    { id: 'r32_07', label: 'Jogo 7',  home: grp1st('D', grResults), away: t('r32_07'), date: '01/07', time: '21:00', loc: '' },
    { id: 'r32_08', label: 'Jogo 8',  home: grp1st('G', grResults), away: t('r32_08'), date: '01/07', time: '17:00', loc: '' },
    { id: 'r32_09', label: 'Jogo 9',  home: grp1st('C', grResults), away: grp2nd('F', grResults),    date: '29/06', time: '14:00', loc: '' },
    { id: 'r32_10', label: 'Jogo 10', home: grp2nd('E', grResults), away: grp2nd('I', grResults),    date: '30/06', time: '14:00', loc: '' },
    { id: 'r32_11', label: 'Jogo 11', home: grp1st('A', grResults), away: t('r32_11'), date: '30/06', time: '22:00', loc: '' },
    { id: 'r32_12', label: 'Jogo 12', home: grp1st('L', grResults), away: t('r32_12'), date: '01/07', time: '13:00', loc: '' },
    { id: 'r32_13', label: 'Jogo 13', home: grp1st('J', grResults), away: grp2nd('H', grResults),    date: '03/07', time: '19:00', loc: '' },
    { id: 'r32_14', label: 'Jogo 14', home: grp2nd('D', grResults), away: grp2nd('G', grResults),    date: '03/07', time: '15:00', loc: '' },
    { id: 'r32_15', label: 'Jogo 15', home: grp1st('B', grResults), away: t('r32_15'), date: '03/07', time: '00:00', loc: '' },
    { id: 'r32_16', label: 'Jogo 16', home: grp1st('K', grResults), away: t('r32_16'), date: '03/07', time: '22:30', loc: '' },
  ];

  return r32;
}

// Winner helper
export function getWinner(id, home, away, mmResults) {
  const r = mmResults[id];
  if (!r) return null;
  if (r.hg > r.ag) return home;
  if (r.ag > r.hg) return away;
  return r.ph > r.pa ? home : r.pa > r.ph ? away : null;
}

// Build full bracket from the fixed mata-mata structure
export function buildFullBracket(grResults, mmResults) {
  const r32 = getKnockoutBracket(grResults);
  const W = (id, home, away) => getWinner(id, home, away, mmResults);

  const r16 = [
    { id: 'r16_01', label: 'Oitavas 1', home: W(r32[0].id, r32[0].home, r32[0].away) || 'TBD', away: W(r32[1].id, r32[1].home, r32[1].away) || 'TBD', date: '04/07', time: '18:00', loc: '' },
    { id: 'r16_02', label: 'Oitavas 2', home: W(r32[2].id, r32[2].home, r32[2].away) || 'TBD', away: W(r32[3].id, r32[3].home, r32[3].away) || 'TBD', date: '04/07', time: '14:00', loc: '' },
    { id: 'r16_03', label: 'Oitavas 3', home: W(r32[4].id, r32[4].home, r32[4].away) || 'TBD', away: W(r32[5].id, r32[5].home, r32[5].away) || 'TBD', date: '06/07', time: '16:00', loc: '' },
    { id: 'r16_04', label: 'Oitavas 4', home: W(r32[6].id, r32[6].home, r32[6].away) || 'TBD', away: W(r32[7].id, r32[7].home, r32[7].away) || 'TBD', date: '06/07', time: '21:00', loc: '' },
    { id: 'r16_05', label: 'Oitavas 5', home: W(r32[8].id, r32[8].home, r32[8].away) || 'TBD', away: W(r32[9].id, r32[9].home, r32[9].away) || 'TBD', date: '05/07', time: '17:00', loc: '' },
    { id: 'r16_06', label: 'Oitavas 6', home: W(r32[10].id, r32[10].home, r32[10].away) || 'TBD', away: W(r32[11].id, r32[11].home, r32[11].away) || 'TBD', date: '05/07', time: '21:00', loc: '' },
    { id: 'r16_07', label: 'Oitavas 7', home: W(r32[12].id, r32[12].home, r32[12].away) || 'TBD', away: W(r32[13].id, r32[13].home, r32[13].away) || 'TBD', date: '07/07', time: '13:00', loc: '' },
    { id: 'r16_08', label: 'Oitavas 8', home: W(r32[14].id, r32[14].home, r32[14].away) || 'TBD', away: W(r32[15].id, r32[15].home, r32[15].away) || 'TBD', date: '07/07', time: '17:00', loc: '' },
  ];

  const qf = [
    { id: 'qf_01', label: 'QUARTAS 1', home: W(r16[0].id, r16[0].home, r16[0].away) || 'TBD', away: W(r16[1].id, r16[1].home, r16[1].away) || 'TBD', date: '09/07', time: '17:00', loc: '' },
    { id: 'qf_02', label: 'QUARTAS 2', home: W(r16[2].id, r16[2].home, r16[2].away) || 'TBD', away: W(r16[3].id, r16[3].home, r16[3].away) || 'TBD', date: '10/07', time: '16:00', loc: '' },
    { id: 'qf_03', label: 'QUARTAS 3', home: W(r16[4].id, r16[4].home, r16[4].away) || 'TBD', away: W(r16[5].id, r16[5].home, r16[5].away) || 'TBD', date: '11/07', time: '18:00', loc: '' },
    { id: 'qf_04', label: 'QUARTAS 4', home: W(r16[6].id, r16[6].home, r16[6].away) || 'TBD', away: W(r16[7].id, r16[7].home, r16[7].away) || 'TBD', date: '11/07', time: '22:00', loc: '' },
  ];

  const sf = [
    { id: 'sf_01', label: 'SEMIFINAL 1', home: W(qf[0].id, qf[0].home, qf[0].away) || 'TBD', away: W(qf[1].id, qf[1].home, qf[1].away) || 'TBD', date: 'SEMIFINAL 1', loc: '' },
    { id: 'sf_02', label: 'SEMIFINAL 2', home: W(qf[2].id, qf[2].home, qf[2].away) || 'TBD', away: W(qf[3].id, qf[3].home, qf[3].away) || 'TBD', date: 'SEMIFINAL 2', loc: '' },
  ];

  const fin = {
    id: 'fin',
    label: 'FINAL',
    home: W(sf[0].id, sf[0].home, sf[0].away) || 'TBD',
    away: W(sf[1].id, sf[1].home, sf[1].away) || 'TBD',
    date: 'Final',
    loc: '',
  };

  const loser = (id, home, away) => {
    const r = mmResults[id];
    if (!r) return null;
    if (r.hg > r.ag) return away;
    if (r.ag > r.hg) return home;
    return r.ph > r.pa ? away : r.pa > r.ph ? home : null;
  };
  const l_sf1 = loser(sf[0].id, sf[0].home, sf[0].away);
  const l_sf2 = loser(sf[1].id, sf[1].home, sf[1].away);
  const third = {
    id: 'third',
    label: '3º LUGAR',
    home: l_sf1 || 'TBD',
    away: l_sf2 || 'TBD',
    date: '3º Lugar',
    loc: '',
  };

  const champion = W('fin', fin.home, fin.away);

  return { r32, r16, qf, sf, fin, third, champion };
}

// Monte Carlo simulation
export function monteCarlo(grResults, numSims = 1000) {
  const probs = iaProbs(grResults);
  const sorted16 = Object.entries(probs).sort((a, b) => b[1] - a[1]).slice(0, 16).map(([t]) => t);
  const wins = {};
  Object.values(GRUPOS).flat().forEach(t => wins[t] = 0);
  
  const simW = (h, a) => {
    const sh = Math.max(iaScore(h, grResults), 0.1);
    const sa = Math.max(iaScore(a, grResults), 0.1);
    return Math.random() * (sh + sa) < sh ? h : a;
  };

  for (let i = 0; i < numSims; i++) {
    const pool = [...sorted16].sort(() => Math.random() - 0.48);
    let ts = [];
    for (let j = 0; j < pool.length; j += 2) {
      ts.push(simW(pool[j], pool[j + 1] || pool[j]));
    }
    while (ts.length > 1) {
      const n = [];
      for (let j = 0; j < ts.length; j += 2) {
        n.push(simW(ts[j], ts[j + 1] || ts[j]));
      }
      ts = n;
    }
    if (wins[ts[0]] !== undefined) wins[ts[0]]++;
  }

  return Object.entries(wins)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([team, count]) => ({ team, count, pct: (count / numSims * 100).toFixed(1) }));
}

// Simulate full tournament
export function simularCopa(grResults) {
  const probs = iaProbs(grResults);
  const allTeams = Object.values(GRUPOS).flat();
  const simW = (h, a) => {
    const sh = Math.max(iaScore(h, grResults), 0.1);
    const sa = Math.max(iaScore(a, grResults), 0.1);
    return Math.random() * (sh + sa) < sh ? h : a;
  };
  const safe = t => (t && allTeams.includes(t)) ? t : Object.entries(probs).sort((a, b) => b[1] - a[1])[Math.floor(Math.random() * 8)][0];

  const r32 = getKnockoutBracket(grResults).map(m => ({ home: safe(m.home), away: safe(m.away) }));
  
  const playRound = (ms) => {
    const ws = [];
    const res = [];
    for (let i = 0; i < ms.length; i += 2) {
      const m1 = ms[i];
      const m2 = ms[i + 1];
      const w1 = simW(m1.home, m1.away);
      res.push({ h: m1.home, a: m1.away, w: w1 });
      if (m2) {
        const w2 = simW(m2.home, m2.away);
        res.push({ h: m2.home, a: m2.away, w: w2 });
        ws.push({ home: w1, away: w2 });
      } else {
        ws.push({ home: w1, away: w1 });
      }
    }
    return { ws, res };
  };

  const round1 = playRound(r32);
  const round2 = playRound(round1.ws);
  const round3 = playRound(round2.ws);
  const round4 = playRound(round3.ws);
  const champ = simW(round4.ws[0]?.home || 'Brasil', round4.ws[0]?.away || 'Argentina');

  return {
    rounds: [
      { label: 'Oitavas (R32)', results: round1.res },
      { label: 'Oitavas (R16)', results: round2.res },
      { label: 'Quartas', results: round3.res },
      { label: 'Semifinais', results: round4.res },
    ],
    champion: champ,
  };
}