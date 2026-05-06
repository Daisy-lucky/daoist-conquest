// ============================================================
// 《道境征途》- AI 系统
// ============================================================

function getAISpells(factionId) {
  const spellSets = {
    biyou: ['wulei', 'sanmei'],
    western: ['jinguang', 'huichun'],
    demon: ['manhai', 'suodi'],
    sanxian: ['huichun', 'sadou']
  };
  return spellSets[factionId] || ['jinguang'];
}

function aiTurn() {
  if (game.gameOver) return;

  const aiFactions = Object.keys(game.factions).filter(fid =>
    !fid.startsWith('player') && fid !== 'neutral' && game.factions[fid].alive
  );

  aiFactions.forEach(fid => {
    const f = game.factions[fid];
    const cities = getFactionCities(fid);
    if (cities.length === 0) return;

    const personality = f.aiPersonality || 'aggressive';

    // AI 策略
    switch (personality) {
      case 'aggressive': aiAggressive(fid); break;
      case 'defensive':  aiDefensive(fid); break;
      case 'guerrilla':  aiGuerrilla(fid); break;
      case 'turtle':     aiTurtle(fid); break;
      default:           aiAggressive(fid); break;
    }
  });
}

// 碧游宫 — 激进好战
function aiAggressive(fid) {
  const cities = getFactionCities(fid);
  if (cities.length === 0) return;

  // 找到兵力最多的城池作为进攻发起城
  cities.sort((a, b) => game.cities[b].troops - game.cities[a].troops);

  for (let srcId of cities) {
    const src = game.cities[srcId];
    if (src.troops < 8) continue;

    // 找可攻击的相邻城池
    const neighbors = getAdjacentCities(srcId);
    const targets = neighbors.filter(nid => {
      const n = game.cities[nid];
      return n.owner !== fid && n.owner !== 'neutral';
    });

    // 优先攻击弱城
    targets.sort((a, b) => game.cities[a].troops - game.cities[b].troops);

    if (targets.length > 0) {
      const tgtId = targets[0];
      const tgt = game.cities[tgtId];
      const attackTroops = Math.floor(src.troops * (0.5 + Math.random() * 0.3));
      if (attackTroops > tgt.troops * 1.2) {
        performAttack(srcId, tgtId, attackTroops);
        break;
      }
    }

    // 如果没有敌方相邻，打中立
    if (src.troops > 15) {
      const neutrals = neighbors.filter(nid => game.cities[nid].owner === 'neutral');
      if (neutrals.length > 0) {
        const tgtId = neutrals[Math.floor(Math.random() * neutrals.length)];
        performAttack(srcId, tgtId, Math.floor(src.troops * 0.6));
        break;
      }
    }
  }
}

// 西方教 — 防守反击
function aiDefensive(fid) {
  const cities = getFactionCities(fid);
  const borderCities = cities.filter(cid => {
    return getAdjacentCities(cid).some(nid => game.cities[nid].owner !== fid);
  });

  // 先加强防守 - 向边境城池调兵
  borderCities.forEach(cid => {
    const src = game.cities[cid];
    // 从后方调兵过来
    getAdjacentCities(cid).forEach(nid => {
      const n = game.cities[nid];
      if (n.owner === fid && n.troops > 10 && src.troops < 20) {
        const moveTroops = Math.min(n.troops - 5, Math.floor(10 - src.troops));
        if (moveTroops > 2) {
          n.troops -= moveTroops;
          src.troops += moveTroops;
        }
      }
    });
  });

  // 如果有1.5倍兵力优势再进攻
  for (let srcId of cities) {
    const src = game.cities[srcId];
    if (src.troops < 20) continue;

    const neighbors = getAdjacentCities(srcId);
    for (let nid of neighbors) {
      const n = game.cities[nid];
      if (n.owner !== fid && n.owner !== 'neutral' && src.troops > n.troops * 1.5) {
        performAttack(srcId, nid, Math.floor(src.troops * 0.6));
        return;
      }
    }
  }
}

// 妖神盟 — 游击骚扰
function aiGuerrilla(fid) {
  const cities = getFactionCities(fid);

  // 找敌方最弱的城偷袭
  let bestTarget = null;
  let bestSrc = null;
  let bestRatio = 0;

  cities.forEach(srcId => {
    const src = game.cities[srcId];
    if (src.troops < 6) return;

    getAdjacentCities(srcId).forEach(nid => {
      const n = game.cities[nid];
      if (n.owner !== fid && n.owner !== 'neutral') {
        const ratio = src.troops / Math.max(n.troops, 1);
        if (ratio > 1.3 && ratio > bestRatio) {
          bestRatio = ratio;
          bestTarget = nid;
          bestSrc = srcId;
        }
      }
    });
  });

  if (bestTarget && bestSrc) {
    const src = game.cities[bestSrc];
    performAttack(bestSrc, bestTarget, Math.floor(src.troops * 0.5));
    return;
  }

  // 偷袭中立
  cities.forEach(srcId => {
    const src = game.cities[srcId];
    if (src.troops < 8) return;
    getAdjacentCities(srcId).forEach(nid => {
      const n = game.cities[nid];
      if (n.owner === 'neutral' && src.troops > n.troops * 1.2) {
        performAttack(srcId, nid, Math.floor(src.troops * 0.6));
        return;
      }
    });
  });
}

// 散仙盟 — 厚积薄发
function aiTurtle(fid) {
  const cities = getFactionCities(fid);

  // 优先升级灵脉
  cities.forEach(cid => {
    const c = game.cities[cid];
    const f = game.factions[fid];
    if (c.level < 8 && f.lingmai > 100) {
      const cost = c.level * 50;
      if (f.lingmai >= cost) {
        f.lingmai -= cost;
        c.level++;
      }
    }
  });

  // 前期不进攻（前15回合），后期爆发
  if (game.turn < 15) return;

  // 后期有兵力优势才打
  cities.sort((a, b) => game.cities[b].troops - game.cities[a].troops);

  for (let srcId of cities) {
    const src = game.cities[srcId];
    if (src.troops < 25) continue;

    const neighbors = getAdjacentCities(srcId);
    for (let nid of neighbors) {
      const n = game.cities[nid];
      if (n.owner !== fid) {
        if (src.troops > n.troops * 1.3) {
          performAttack(srcId, nid, Math.floor(src.troops * 0.5));
          return;
        }
      }
    }
  }
}
