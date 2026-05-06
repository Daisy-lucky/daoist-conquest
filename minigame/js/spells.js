// ============================================================
// 《道境征途》- 法术与法宝系统
// ============================================================

const SPELLS = {
  wulei: {
    id: 'wulei', name: '五雷正法', category: '攻击',
    cost: 80, cooldown: 3, desc: '召唤天雷，对目标城池造成5~8兵力伤害',
    icon: '⚡',
    execute: (targetCityId) => {
      const city = game.cities[targetCityId];
      if (!city) return false;
      const dmg = 5 + Math.floor(Math.random() * 4);
      city.troops = Math.max(0, city.troops - dmg);
      addLog(`⚡ 五雷正法`, `对 ${city.name} 造成 ${dmg} 点伤害`);
      return true;
    }
  },
  sanmei: {
    id: 'sanmei', name: '三昧真火', category: '攻击',
    cost: 150, cooldown: 5, desc: '三昧真火！对目标及相邻城池造成3~5伤害',
    icon: '🔥',
    execute: (targetCityId) => {
      const city = game.cities[targetCityId];
      if (!city) return false;
      const dmg = 3 + Math.floor(Math.random() * 3);
      city.troops = Math.max(0, city.troops - dmg);
      // 相邻也受伤
      getAdjacentCities(targetCityId).forEach(nid => {
        const n = game.cities[nid];
        if (n.owner !== 'neutral') {
          n.troops = Math.max(0, n.troops - Math.floor(dmg * 0.6));
        }
      });
      addLog(`🔥 三昧真火`, `对 ${city.name} 及相邻造成 ${dmg} 点伤害`);
      return true;
    }
  },
  jinguang: {
    id: 'jinguang', name: '金光咒', category: '防御',
    cost: 60, cooldown: 2, desc: '金光护体，目标城池防御+2，持续2回合',
    icon: '🛡️',
    execute: (targetCityId) => {
      const city = game.cities[targetCityId];
      if (!city) return false;
      city.spellBonus = 2;
      city.spellTurns = 2;
      addLog(`🛡️ 金光咒`, `${city.name} 防御+2，持续2回合`);
      return true;
    }
  },
  huichun: {
    id: 'huichun', name: '回春术', category: '防御',
    cost: 50, cooldown: 2, desc: '春风化雨，目标城池恢复4~6兵力',
    icon: '💚',
    execute: (targetCityId) => {
      const city = game.cities[targetCityId];
      if (!city) return false;
      const heal = 4 + Math.floor(Math.random() * 3);
      city.troops += heal;
      addLog(`💚 回春术`, `${city.name} 恢复 ${heal} 兵力`);
      return true;
    }
  },
  sadou: {
    id: 'sadou', name: '撒豆成兵', category: '辅助',
    cost: 100, cooldown: 4, desc: '撒豆成兵！目标城池立即增加8兵力',
    icon: '🫘',
    execute: (targetCityId) => {
      const city = game.cities[targetCityId];
      if (!city) return false;
      city.troops += 8;
      addLog(`🫘 撒豆成兵`, `${city.name} 增加8兵力`);
      return true;
    }
  },
  suodi: {
    id: 'suodi', name: '缩地成寸', category: '辅助',
    cost: 200, cooldown: 6, desc: '缩地成寸！两座己方城池之间进行一次兵力调遣',
    icon: '🌀',
    execute: (fromId, toId) => {
      const from = game.cities[fromId];
      const to = game.cities[toId];
      if (!from || !to) return false;
      if (from.owner !== 'player' || to.owner !== 'player') return false;
      const move = Math.floor(from.troops * 0.5);
      if (move < 1) return false;
      from.troops -= move;
      to.troops += move;
      addLog(`🌀 缩地成寸`, `${from.name} → ${to.name} 调遣 ${move} 兵力`);
      return true;
    }
  },
  manhai: {
    id: 'manhai', name: '瞒天过海', category: '策略',
    cost: 120, cooldown: 5, desc: '瞒天过海！下次进攻AI防守判断降低',
    icon: '🌫️',
    execute: () => {
      addLog(`🌫️ 瞒天过海`, '下次进攻获得优势！');
      return true;
    }
  },
  jinghua: {
    id: 'jinghua', name: '净化术', category: '辅助',
    cost: 100, cooldown: 3, desc: '净化目标城池的浊气污染',
    icon: '✨',
    execute: (targetCityId) => {
      const city = game.cities[targetCityId];
      if (!city) return false;
      city.pollution = false;
      addLog(`✨ 净化术`, `${city.name} 的浊气已被净化`);
      return true;
    }
  }
};

// 法宝定义
const ARTIFACTS = {
  xuanyuanjian: {
    id: 'xuanyuanjian', name: '轩辕剑', type: '武器',
    desc: '上古神剑，所有进攻部队战力+2',
    icon: '⚔️',
    effect: 'attack_boost'
  },
  baguaxianyi: {
    id: 'baguaxianyi', name: '八卦仙衣', type: '防具',
    desc: '八卦护体，所有城池防御+1',
    icon: '☯️',
    effect: 'defense_boost'
  },
  pangutang: {
    id: 'pangutang', name: '盘古幡', type: '灵宝',
    desc: '每回合额外+15灵脉产出',
    icon: '🏴',
    effect: 'income_boost'
  },
  taijitu: {
    id: 'taijitu', name: '太极图', type: '灵宝',
    desc: '战斗后30%概率保留50%阵亡兵力',
    icon: '☯️',
    effect: 'retain_troops'
  }
};

function getPlayerSpells() {
  return game.factions.player.spells.map(sid => SPELLS[sid]).filter(Boolean);
}

function canCastSpell(factionId, spellId) {
  const f = game.factions[factionId];
  const spell = SPELLS[spellId];
  if (!spell || !f) return false;
  if (f.lingmai < spell.cost) return false;
  if (f.spellCooldowns[spellId] && f.spellCooldowns[spellId] > 0) return false;
  return true;
}

function castSpell(factionId, spellId, targetId, targetId2) {
  const f = game.factions[factionId];
  const spell = SPELLS[spellId];
  if (!canCastSpell(factionId, spellId)) return false;

  f.lingmai -= spell.cost;
  f.spellCooldowns[spellId] = spell.cooldown;

  if (spellId === 'suodi') {
    return spell.execute(targetId, targetId2);
  }
  return spell.execute(targetId);
}
