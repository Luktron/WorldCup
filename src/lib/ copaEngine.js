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

// Knockout bracket builder - FIFA 2026 format with correct crossings
export function getKnockoutBracket(grResults) {
  const g = {};
  Object.keys(GRUPOS).forEach(k => {
    g[k] = { p1: grp1st(k, grResults), p2: grp2nd(k, grResults), p3: grp3rd(k, grResults) };
  });

  const bestThirds = getBestThirds(grResults);
  const bt = (pools) => {
    const poolArr = pools.split('/');
    const found = bestThirds.find(t => poolArr.includes(t.group));
    return found ? found.n : `3º ${pools}`;
  };

  // Round of 32: 16 matches
  // 1st vs 2nd crossings + 3rd place matches
  const r32 = [
    { id: 'r32_01', label: 'R32-1',  home: g.A.p1, away: bt('C/D/E/F'), date: '28 Jun', loc: 'Kansas City' },
    { id: 'r32_02', label: 'R32-2',  home: g.B.p2, away: g.F.p2,        date: '28 Jun', loc: 'Los Angeles' },
    { id: 'r32_03', label: 'R32-3',  home: g.C.p1, away: bt('A/B/F/G'), date: '28 Jun', loc: 'Houston' },
    { id: 'r32_04', label: 'R32-4',  home: g.D.p2, away: g.E.p2,        date: '28 Jun', loc: 'Dallas' },
    { id: 'r32_05', label: 'R32-5',  home: g.E.p1, away: bt('B/C/G/H'), date: '29 Jun', loc: 'Nova York/NJ' },
    { id: 'r32_06', label: 'R32-6',  home: g.F.p1, away: g.D.p1,        date: '29 Jun', loc: 'Seattle' },
    { id: 'r32_07', label: 'R32-7',  home: g.G.p1, away: bt('D/E/H/I'), date: '29 Jun', loc: 'San Francisco' },
    { id: 'r32_08', label: 'R32-8',  home: g.H.p2, away: g.A.p2,        date: '29 Jun', loc: 'Filadélfia' },
    { id: 'r32_09', label: 'R32-9',  home: g.I.p1, away: bt('E/F/I/J'), date: '30 Jun', loc: 'Miami' },
    { id: 'r32_10', label: 'R32-10', home: g.J.p1, away: g.L.p2,        date: '30 Jun', loc: 'Atlanta' },
    { id: 'r32_11', label: 'R32-11', home: g.K.p1, away: bt('F/G/J/K'), date: '30 Jun', loc: 'Vancouver' },
    { id: 'r32_12', label: 'R32-12', home: g.L.p1, away: g.H.p1,        date: '30 Jun', loc: 'Boston' },
    { id: 'r32_13', label: 'R32-13', home: g.B.p1, away: bt('A/C/D/L'), date: '01 Jul', loc: 'Toronto' },
    { id: 'r32_14', label: 'R32-14', home: g.C.p2, away: g.J.p2,        date: '01 Jul', loc: 'Guadalajara' },
    { id: 'r32_15', label: 'R32-15', home: g.I.p2, away: g.K.p2,        date: '01 Jul', loc: 'Monterrey' },
    { id: 'r32_16', label: 'R32-16', home: g.G.p2, away: bt('H/I/K/L'), date: '01 Jul', loc: 'Cidade do México' },
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

// Build full bracket from r32 results onwards
export function buildFullBracket(grResults, mmResults) {
  const r32 = getKnockoutBracket(grResults);
  const W = (id, home, away) => getWinner(id, home, away, mmResults);

  // Round of 16: 8 matches (winners of adjacent R32 matches)
  const r16 = [];
  for (let i = 0; i < 16; i += 2) {
    const m1 = r32[i];
    const m2 = r32[i + 1];
    const w1 = W(m1.id, m1.home, m1.away);
    const w2 = W(m2.id, m2.home, m2.away);
    r16.push({
      id: `r16_${String(Math.floor(i / 2) + 1).padStart(2, '0')}`,
      label: `R16-${Math.floor(i / 2) + 1}`,
      home: w1 || 'TBD',
      away: w2 || 'TBD',
      date: `${4 + Math.floor(i / 4)} Jul`,
      loc: '',
      fromHome: m1.label,
      fromAway: m2.label,
    });
  }

  // Quarter-finals: 4 matches
  const qf = [];
  for (let i = 0; i < 8; i += 2) {
    const m1 = r16[i];
    const m2 = r16[i + 1];
    const w1 = W(m1.id, m1.home, m1.away);
    const w2 = W(m2.id, m2.home, m2.away);
    qf.push({
      id: `qf_${String(Math.floor(i / 2) + 1).padStart(2, '0')}`,
      label: `QF-${Math.floor(i / 2) + 1}`,
      home: w1 || 'TBD',
      away: w2 || 'TBD',
      date: `${8 + Math.floor(i / 4)} Jul`,
      loc: '',
    });
  }

  // Semi-finals: 2 matches
  const sf = [];
  for (let i = 0; i < 4; i += 2) {
    const m1 = qf[i];
    const m2 = qf[i + 1];
    const w1 = W(m1.id, m1.home, m1.away);
    const w2 = W(m2.id, m2.home, m2.away);
    sf.push({
      id: `sf_${String(Math.floor(i / 2) + 1).padStart(2, '0')}`,
      label: `SF-${Math.floor(i / 2) + 1}`,
      home: w1 || 'TBD',
      away: w2 || 'TBD',
      date: `${13 + Math.floor(i / 2)} Jul`,
      loc: '',
    });
  }

  // Final
  const w_sf1 = W(sf[0].id, sf[0].home, sf[0].away);
  const w_sf2 = W(sf[1].id, sf[1].home, sf[1].away);
  const fin = {
    id: 'fin',
    label: 'FINAL',
    home: w_sf1 || 'TBD',
    away: w_sf2 || 'TBD',
    date: '19 Jul',
    loc: 'MetLife, NJ',
  };

  // 3rd place
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
    date: '18 Jul',
    loc: 'MetLife, NJ',
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