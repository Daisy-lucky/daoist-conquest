// ============================================================
// 《道境征途》- 游戏状态与核心逻辑
// ============================================================

let game = null;

function initGame(difficulty = 'normal') {
  game = {
    turn: 1,
    phase: 'deploy',  // deploy, battle, spell, end
    difficulty: difficulty,
    selectedCity: null,
    sourceCity: null,
    actionMode: null,  // 'move', 'attack', 'spell', null
    message: '',
    log: [],
    gameOver: false,
    victory: false,
    // 难度系数
    difficultyMultiplier: {
      easy: 0.7,
      normal: 1.0,
      hard: 1.3,
      master: 1.6
    }[difficulty] || 1.0
  };

  // 初始化城池
  game.cities = {};
  CITIES.forEach(c => {
    game.cities[c.id] = {
      ...c,
      owner: null,
      troops: c.initTroops,
      level: c.initLevel,
      pollution: false,
      spellBonus: 0,      // 临时法术加成
      spellTurns: 0,      // 法术持续回合
      movedThisTurn: false,
      attackedThisTurn: false,
    };
  });

  // 分配归属
  Object.entries(INITIAL_OWNERSHIP).forEach(([factionId, cityIds]) => {
    cityIds.forEach(cid => {
      if (game.cities[cid]) {
        game.cities[cid].owner = factionId;
        game.cities[cid].troops = game.cities[cid].initTroops;
      }
    });
  });

  // 中立城池
  NEUTRAL_CITIES.forEach(cid => {
    if (game.cities[cid]) {
      game.cities[cid].owner = 'neutral';
      game.cities[cid].troops = Math.floor(Math.random() * 8) + 6;
    }
  });

  // 初始化势力状态
  game.factions = {};
  Object.entries(FACTIONS).forEach(([id, f]) => {
    game.factions[id] = {
      ...f,
      alive: true,
      eliminated: false,
      lingmai: 50,
      gongde: 0,
      spells: id === 'player' ? ['wulei', 'jinguang'] : getAISpells(id),
      artifacts: [],
      spellCooldowns: {}
    };
    // 玩家初始资源多一些
    if (id === 'player') {
      game.factions[id].lingmai = 100;
      game.factions[id].gongde = 10;
    }
  });

  // 初始化连接缓存
  game.adjacency = {};
  CITIES.forEach(c => { game.adjacency[c.id] = []; });
  CONNECTIONS.forEach(([a, b]) => {
    if (game.adjacency[a]) game.adjacency[a].push(b);
    if (game.adjacency[b]) game.adjacency[b].push(a);
  });

  game.log = [];
  addLog('☯ 道境征途 · 序幕', '浊气横行之世，你奉师命下山，踏上了平定三界的征途...');
  addLog('📜 任务', `第 ${game.turn} 回合 — 巩固你的领地，扩张势力！`);
  
  // 清除选中状态
  game.selectedCity = null;
  game.sourceCity = null;
  game.actionMode = null;
}

function getCity(id) { return game.cities[id]; }
function getFaction(id) { return game.factions[id]; }

function getAdjacentCities(cityId) {
  return game.adjacency[cityId] || [];
}

function getFactionCities(factionId) {
  return CITIES.filter(c => game.cities[c.id].owner === factionId).map(c => c.id);
}

function getFactionTroopCount(factionId) {
  let total = 0;
  getFactionCities(factionId).forEach(cid => { total += game.cities[cid].troops; });
  return total;
}

function getFactionIncome(factionId) {
  let total = 0;
  getFactionCities(factionId).forEach(cid => {
    const c = game.cities[cid];
    if (c.pollution) return;
    let income = 10 * (1 + c.level * 0.5);
    const region = REGIONS[c.region];
    const bonuses = { dongtian: 1.3, kunlun: 1.2, donghai: 1.1, qingcheng: 1.1, tianque: 1.25, youming: 0.9 };
    income *= bonuses[c.region] || 1.0;
    total += Math.floor(income);
  });
  return Math.floor(total * game.difficultyMultiplier);
}

function addLog(title, detail) {
  if (!game) return;
  game.log.unshift({ turn: game.turn, title, detail });
  if (game.log.length > 100) game.log.pop();
}

// ---------- 回合系统 ----------

function endTurn() {
  if (game.gameOver) return;

  // 1. AI 行动
  aiTurn();

  // 2. 资源产出
  Object.keys(game.factions).forEach(fid => {
    if (fid === 'neutral') return;
    const f = game.factions[fid];
    if (!f.alive) return;
    const income = getFactionIncome(fid);
    f.lingmai += income;
    // 占领城池自动恢复少量兵力
    getFactionCities(fid).forEach(cid => {
      const c = game.cities[cid];
      if (c.owner === fid && !c.pollution && c.troops < 999) {
        c.troops += Math.max(1, Math.floor(c.level * 0.5));
      }
    });
  });

  // 3. 法术状态更新
  CITIES.forEach(c => {
    const city = game.cities[c.id];
    if (city.spellTurns > 0) {
      city.spellTurns--;
      if (city.spellTurns === 0) city.spellBonus = 0;
    }
    city.movedThisTurn = false;
    city.attackedThisTurn = false;
  });

  // 4. 冷却缩减
  Object.keys(game.factions).forEach(fid => {
    const f = game.factions[fid];
    if (!f.alive) return;
    Object.keys(f.spellCooldowns).forEach(sid => {
      if (f.spellCooldowns[sid] > 0) f.spellCooldowns[sid]--;
    });
  });

  // 5. 增加回合
  game.turn++;
  game.phase = 'deploy';
  game.selectedCity = null;
  game.sourceCity = null;
  game.actionMode = null;
  game.message = '';

  // 6. 检查胜负
  checkWinLose();

  // 7. 随机事件（每5回合）
  if (game.turn % 5 === 0 && !game.gameOver) {
    triggerRandomEvent();
  }

  addLog('⏳ 回合结束', `第 ${game.turn} 回合开始`);
}

// ---------- 战斗系统 ----------

function calculateBattle(attackerFid, defenderFid, attackTroops, city) {
  const attackPower = attackTroops * (1 + 0.1); // simplified: +10% base
  const defenseBonus = city.defense + city.spellBonus;
  const defPower = city.troops * (1 + defenseBonus * 0.3);

  const ratio = attackPower / Math.max(defPower, 1);
  let victory = ratio > 1.0;

  // 随机因素
  const luck = 0.85 + Math.random() * 0.3;
  const finalRatio = ratio * luck;

  let remaining = 0;
  let defRemaining = 0;

  if (finalRatio > 1.0) {
    // 进攻方胜利
    remaining = Math.floor(attackTroops * (0.3 + Math.random() * 0.3));
    defRemaining = 0;
  } else {
    // 防守方胜利
    remaining = 0;
    defRemaining = Math.floor(city.troops * (0.5 + Math.random() * 0.3));
  }

  return {
    victory: finalRatio > 1.0,
    remainingTroops: Math.max(remaining, 0),
    defRemainingTroops: Math.max(defRemaining, 0),
    attackPower: Math.floor(attackPower),
    defPower: Math.floor(defPower),
    ratio: finalRatio
  };
}

function performAttack(fromCityId, toCityId, troops) {
  const from = game.cities[fromCityId];
  const to = game.cities[toCityId];
  if (!from || !to) return null;
  if (from.owner === to.owner) return null;
  if (from.troops <= troops) troops = from.troops - 1; // 至少要留1兵
  if (troops <= 0) return null;

  const result = calculateBattle(from.owner, to.owner, troops, to);

  from.troops -= troops;

  if (result.victory) {
    // 占领
    const oldOwner = to.owner;
    to.owner = from.owner;
    to.troops = result.remainingTroops;
    to.attackedThisTurn = true;
    addLog(`⚔️ 攻城胜利！`, `${from.name} → ${to.name}，剩余兵力: ${result.remainingTroops}`);
    
    // 如果原所有者失去所有城池，势力覆灭
    if (oldOwner && oldOwner !== 'neutral' && oldOwner !== from.owner) {
      if (getFactionCities(oldOwner).length === 0) {
        game.factions[oldOwner].alive = false;
        game.factions[oldOwner].eliminated = true;
        addLog(`💀 势力覆灭`, `${FACTIONS[oldOwner]?.name || oldOwner} 已失去所有领地！`);
      }
    }
    
    // 玩家占领获得功德
    if (from.owner === 'player') {
      game.factions.player.gongde += 5;
    }
  } else {
    // 进攻失败
    to.troops = result.defRemainingTroops;
    addLog(`⚔️ 攻城失败！`, `${from.name} → ${to.name}，守军剩余: ${result.defRemainingTroops}`);
  }

  checkWinLose();
  return result;
}

// ---------- 胜负检查 ----------

function checkWinLose() {
  const playerCities = getFactionCities('player');
  const aliveAIs = Object.keys(game.factions).filter(fid =>
    fid !== 'player' && fid !== 'neutral' && game.factions[fid].alive
  );

  if (playerCities.length === 0) {
    game.gameOver = true;
    game.victory = false;
    addLog('💀 败北', '你已失去所有领地，三界沦陷...');
    return;
  }

  // 占领所有城池（包括中立的）
  if (playerCities.length === CITIES.length) {
    game.gameOver = true;
    game.victory = true;
    addLog('🏆 大获全胜！', '你已统一三界，天地清明，万仙朝拜！');
    return;
  }

  // 所有AI覆灭
  if (aliveAIs.length === 0 && playerCities.length > 0) {
    // 还需要占领中立城池才算完全胜利
    const neutralCount = CITIES.filter(c => game.cities[c.id].owner === 'neutral').length;
    if (neutralCount === 0) {
      game.gameOver = true;
      game.victory = true;
      addLog('🏆 大获全胜！', '所有敌对势力已灭，三界重归太平！');
    }
  }
}

// ---------- 随机事件 ----------

function triggerRandomEvent() {
  const events = [
    { name: '仙鹤报喜', good: true, desc: '一只仙鹤衔来灵芝，所有己方城池恢复少量兵力。',
      effect: () => { getFactionCities('player').forEach(cid => { game.cities[cid].troops += 3; }); }},
    { name: '灵脉喷涌', good: true, desc: '灵脉突然喷涌，选择一座城池灵脉等级+1！',
      effect: () => {
        const pc = getFactionCities('player');
        if (pc.length > 0) {
          const c = game.cities[pc[Math.floor(Math.random() * pc.length)]];
          if (c.level < 10) c.level++;
        }
      }},
    { name: '天降甘露', good: true, desc: '天降甘霖，所有城池恢复20%兵力。',
      effect: () => { getFactionCities('player').forEach(cid => { game.cities[cid].troops = Math.floor(game.cities[cid].troops * 1.2); }); }},
    { name: '浊气爆发', good: false, desc: '浊气突然爆发！一座城池被污染，产出归零持续3回合。',
      effect: () => {
        const pc = getFactionCities('player');
        if (pc.length > 0) {
          const c = game.cities[pc[Math.floor(Math.random() * pc.length)]];
          c.pollution = true;
          setTimeout(() => { if (c) c.pollution = false; }, 3000);
        }
      }},
    { name: '妖兽暴动', good: false, desc: '妖兽暴动！一座己方城池损失8兵力。',
      effect: () => {
        const pc = getFactionCities('player');
        if (pc.length > 0) {
          const c = game.cities[pc[Math.floor(Math.random() * pc.length)]];
          c.troops = Math.max(0, c.troops - 8);
        }
      }},
    { name: '悟道顿悟', good: true, desc: '你静心悟道，功德+20。',
      effect: () => { game.factions.player.gongde += 20; }},
  ];

  const evt = events[Math.floor(Math.random() * events.length)];
  addLog(`📜 随机事件：${evt.name}`, evt.desc);
  evt.effect();
  game.message = `【事件】${evt.name}: ${evt.desc}`;
}
