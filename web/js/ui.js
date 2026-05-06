// ============================================================
// 《道境征途》- UI 渲染与交互
// ============================================================

// ---------- 常量 ----------
const UI = {
  canvasWidth: 1060,
  canvasHeight: 720,
  cityRadius: 18,
  regionPadding: 5
};

// ---------- 初始化 ----------
function initUI() {
  renderAll();
  bindEvents();
}

// ---------- 主渲染函数 ----------
function renderAll() {
  if (!game) return;
  renderTopBar();
  renderMap();
  renderSidePanel();
  renderBottomBar();
  renderLog();
  renderGameOver();
}

// ---------- 顶部信息栏 ----------
function renderTopBar() {
  const bar = document.getElementById('top-bar');
  if (!bar) return;

  const f = game.factions.player;
  const turnInfo = game.gameOver
    ? (game.victory ? '🏆 胜利！' : '💀 败北')
    : `第 ${game.turn} 回合`;

  bar.innerHTML = `
    <div class="top-left">
      <span class="game-title">☯ 道境征途</span>
      <span class="turn-info">${turnInfo}</span>
    </div>
    <div class="top-right">
      <span class="resource"><span class="res-icon">🧿</span> 灵脉: ${f.lingmai}</span>
      <span class="resource"><span class="res-icon">⭐</span> 功德: ${f.gongde}</span>
      <span class="resource"><span class="res-icon">🏙️</span> 城池: ${getFactionCities('player').length}/${CITIES.length}</span>
      <span class="resource"><span class="res-icon">⚔️</span> 兵力: ${getFactionTroopCount('player')}</span>
    </div>
  `;
}

// ---------- 地图渲染 ----------
function renderMap() {
  const container = document.getElementById('map-container');
  if (!container) return;

  // 使用 SVG 渲染地图
  const svgW = UI.canvasWidth;
  const svgH = UI.canvasHeight;

  let svg = `<svg width="100%" height="100%" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="glow-light"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="neutral-grad"><stop offset="0%" stop-color="#888"/><stop offset="100%" stop-color="#555"/></radialGradient>
    </defs>
    <rect width="${svgW}" height="${svgH}" fill="none"/>`;

  // 绘制区域背景
  const regionBounds = calculateRegionBounds();
  Object.entries(REGIONS).forEach(([rid, reg]) => {
    const bounds = regionBounds[rid];
    if (!bounds) return;
    svg += `<rect x="${bounds.x - 15}" y="${bounds.y - 15}" width="${bounds.w + 30}" height="${bounds.h + 30}" 
      rx="12" fill="${reg.color}11" stroke="${reg.color}33" stroke-width="1" stroke-dasharray="5,3"/>`;
    svg += `<text x="${bounds.x + bounds.w/2}" y="${bounds.y - 5}" 
      text-anchor="middle" fill="${reg.color}" font-size="13" font-weight="bold" opacity="0.7">${reg.name}</text>`;
  });

  // 绘制连接线
  CONNECTIONS.forEach(([a, b]) => {
    const ca = game.cities[a];
    const cb = game.cities[b];
    if (!ca || !cb) return;

    const isSameOwner = ca.owner === cb.owner && ca.owner !== 'neutral';
    const strokeColor = isSameOwner
      ? (getFaction(ca.owner)?.color || '#666') + '66'
      : '#555';
    const strokeWidth = isSameOwner ? 2.5 : 1.5;

    svg += `<line x1="${ca.x}" y1="${ca.y}" x2="${cb.x}" y2="${cb.y}" 
      stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="0.6"/>`;
  });

  // 高亮选中城池的连接
  if (game.selectedCity) {
    const sc = game.cities[game.selectedCity];
    if (sc) {
      getAdjacentCities(game.selectedCity).forEach(nid => {
        const n = game.cities[nid];
        if (!n) return;
        const isTargetable = n.owner !== sc.owner;
        svg += `<line x1="${sc.x}" y1="${sc.y}" x2="${n.x}" y2="${n.y}" 
          stroke="${isTargetable ? '#ff6b6b' : '#4ecdc4'}" stroke-width="3" 
          stroke-dasharray="${isTargetable ? '' : '6,3'}" opacity="0.8" filter="url(#glow-light)"/>`;
      });
    }
  }

  // 绘制城池
  CITIES.forEach(c => {
    const city = game.cities[c.id];
    if (!city) return;

    const faction = city.owner && getFaction(city.owner);
    const fillColor = faction ? faction.color : '#888';
    const isSelected = game.selectedCity === c.id;
    const isSource = game.sourceCity === c.id;
    const isPlayerCity = city.owner === 'player';

    // 城池外圈光晕
    if (isSelected || isSource) {
      svg += `<circle cx="${city.x}" cy="${city.y}" r="${UI.cityRadius + 8}" 
        fill="none" stroke="${fillColor}" stroke-width="2" opacity="0.6" filter="url(#glow)">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite"/>
      </circle>`;
    }

    // 城池主体
    svg += `<circle cx="${city.x}" cy="${city.y}" r="${UI.cityRadius}" 
      fill="${fillColor}33" stroke="${isSelected ? '#fff' : fillColor}" 
      stroke-width="${isSelected ? 3 : 2}" class="city-circle" data-city="${c.id}"/>`;

    // 城池内部图标/等级
    const typeIcon = { '圣地': '🏛️', '要塞': '🏯', '福地': '🏔️', '秘境': '🌿' }[city.type] || '🏘️';
    svg += `<text x="${city.x}" y="${city.y + 5}" text-anchor="middle" fill="#fff" font-size="14" 
      class="city-icon" data-city="${c.id}">${typeIcon}</text>`;

    // 兵力数字
    svg += `<text x="${city.x}" y="${city.y - UI.cityRadius - 5}" text-anchor="middle" 
      fill="${faction ? faction.lightColor : '#aaa'}" font-size="12" font-weight="bold"
      class="city-troops" data-city="${c.id}">${city.troops}</text>`;

    // 城池名称
    svg += `<text x="${city.x}" y="${city.y + UI.cityRadius + 15}" text-anchor="middle" 
      fill="#ddd" font-size="11" class="city-name" data-city="${c.id}">${city.name}</text>`;

    // 灵脉等级指示
    if (city.level > 0) {
      const dots = '●'.repeat(Math.min(city.level, 5));
      svg += `<text x="${city.x}" y="${city.y + UI.cityRadius + 28}" text-anchor="middle" 
        fill="${fillColor}99" font-size="8" data-city="${c.id}">${dots}</text>`;
    }

    // 浊气污染标记
    if (city.pollution) {
      svg += `<text x="${city.x - 5}" y="${city.y - UI.cityRadius - 15}" text-anchor="middle" 
        fill="#e74c3c" font-size="14" filter="url(#glow)">💀</text>`;
    }

    // 所有者标记（玩家城池加特殊标记）
    if (city.owner === 'player') {
      svg += `<circle cx="${city.x + UI.cityRadius - 4}" cy="${city.y - UI.cityRadius + 4}" r="4" 
        fill="#3498db" stroke="#fff" stroke-width="1"/>`;
    }
  });

  svg += '</svg>';

  container.innerHTML = svg;

  // 添加点击事件到城池元素
  document.querySelectorAll('[data-city]').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      const cityId = el.dataset.city;
      onCityClick(cityId);
    });
  });
}

// ---------- 侧边栏 ----------
function renderSidePanel() {
  const panel = document.getElementById('side-panel');
  if (!panel) return;

  // 选定城池信息
  let html = '<div class="panel-section"><h3>📋 当前选定</h3>';

  if (game.selectedCity) {
    const city = game.cities[game.selectedCity];
    if (city) {
      const faction = getFaction(city.owner);
      const ownerName = faction ? faction.name : (city.owner === 'neutral' ? '中立' : city.owner);

      html += `
        <div class="city-detail">
          <div class="detail-name" style="color:${faction ? faction.color : '#888'}">${city.name}</div>
          <div class="detail-type">${city.type} · ${REGIONS[city.region]?.name || ''}</div>
          <div class="detail-owner">归属: ${ownerName}</div>
          <div class="detail-stats">
            <span>⚔️ 兵力: <b>${city.troops}</b></span>
            <span>🛡️ 防御: <b>${city.defense}</b></span>
            <span>🧿 灵脉: <b>Lv.${city.level}</b></span>
          </div>
          <div class="detail-desc">${city.desc}</div>
        </div>
        <div class="city-actions">`;

      // 玩家城池的操作按钮
      if (city.owner === 'player' && !game.gameOver) {
        html += `
          <button class="btn btn-action" onclick="startMoveTroops('${city.id}')" ${city.troops <= 1 ? 'disabled' : ''}>🚀 调兵</button>
          <button class="btn btn-action" onclick="startAttack('${city.id}')" ${city.troops <= 1 ? 'disabled' : ''}>⚔️ 进攻</button>
          <button class="btn btn-action" onclick="showSpellTarget('${city.id}')">🔮 施法</button>`;
      }

      // 敌方城池信息
      if (city.owner !== 'player' && city.owner !== 'neutral') {
        html += `<div class="enemy-info">⚠️ 敌方城池 — 点击你的相邻城池发起进攻</div>`;
      }

      html += `</div>`;
    }
  } else {
    html += `<div class="placeholder-text">点击地图上的城池查看详情</div>`;
  }

  // 消息显示
  if (game.message) {
    html += `<div class="game-message">${game.message}</div>`;
  }

  // 法术栏（仅玩家）
  if (!game.gameOver) {
    html += '</div><div class="panel-section"><h3>🔮 法术</h3><div class="spell-list">';
    getPlayerSpells().forEach(spell => {
      const canCast = canCastSpell('player', spell.id);
      const cd = game.factions.player.spellCooldowns[spell.id] || 0;
      html += `<div class="spell-item ${canCast ? '' : 'spell-cd'}" onclick="${canCast ? `showSpellTarget('${spell.id}', true)` : ''}">
        <span class="spell-icon">${spell.icon}</span>
        <span class="spell-name">${spell.name}</span>
        <span class="spell-cost">🧿${spell.cost}</span>
        ${cd > 0 ? `<span class="spell-cd-badge">${cd}回合</span>` : ''}
      </div>`;
    });
    html += '</div></div>';
  }

  // 势力状态
  html += '<div class="panel-section"><h3>🏰 势力</h3><div class="faction-list">';
  Object.entries(FACTIONS).forEach(([fid, f]) => {
    const fg = game.factions[fid];
    if (!fg) return;
    const cityCount = getFactionCities(fid).length;
    const troops = getFactionTroopCount(fid);
    html += `<div class="faction-item ${fg.alive ? '' : 'faction-dead'}">
      <span class="faction-dot" style="background:${f.color}"></span>
      <span class="faction-name">${f.name}</span>
      <span class="faction-stats">🏙️${cityCount} ⚔️${troops}</span>
      ${!fg.alive ? '<span class="dead-tag">覆灭</span>' : ''}
    </div>`;
  });
  html += '</div></div>';

  panel.innerHTML = html;
}

// ---------- 底部操作栏 ----------
function renderBottomBar() {
  const bar = document.getElementById('bottom-bar');
  if (!bar || game.gameOver) return;

  let html = '<div class="bottom-inner">';

  // 操作提示
  if (game.actionMode === 'move') {
    html += `<span class="action-hint">🚀 调兵模式: 点击相邻己方城池作为目标</span>`;
    html += `<button class="btn btn-cancel" onclick="cancelAction()">✕ 取消</button>`;
  } else if (game.actionMode === 'attack') {
    html += `<span class="action-hint">⚔️ 进攻模式: 点击相邻敌方城池发起进攻</span>`;
    html += `<button class="btn btn-cancel" onclick="cancelAction()">✕ 取消</button>`;
  } else if (game.actionMode === 'spell') {
    html += `<span class="action-hint">🔮 法术模式: 点击目标城池施放法术</span>`;
    html += `<button class="btn btn-cancel" onclick="cancelAction()">✕ 取消</button>`;
  } else {
    html += `<span class="action-hint">点击己方城池选择操作</span>`;
  }

  html += `<button class="btn btn-end-turn" onclick="onEndTurn()">⏳ 结束回合</button>`;
  html += '</div>';

  bar.innerHTML = html;
}

// ---------- 战报 ----------
function renderLog() {
  const container = document.getElementById('log-panel');
  if (!container) return;

  let html = '<h3>📜 战报</h3><div class="log-list">';
  game.log.slice(0, 15).forEach(entry => {
    html += `<div class="log-entry">
      <span class="log-turn">[${entry.turn}]</span>
      <span class="log-title">${entry.title}</span>
      <span class="log-detail">${entry.detail}</span>
    </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ---------- 游戏结束 ----------
function renderGameOver() {
  const overlay = document.getElementById('game-over-overlay');
  if (!overlay) return;

  if (game.gameOver) {
    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div class="game-over-content ${game.victory ? 'victory' : 'defeat'}">
        <h1>${game.victory ? '🏆 三界一统！' : '💀 道消魔长'}</h1>
        <p>${game.victory
          ? '你成功净化了天地灵脉，三界重归太平，万仙朝拜！<br>天道归位，你已证道成圣。'
          : '浊气彻底侵蚀了三界，你的道行尽失...<br>或许下一次，你能改变命运。'}</p>
        <p class="stats-line">用时 ${game.turn} 回合 | 占领 ${getFactionCities('player').length}/${CITIES.length} 座城池</p>
        <button class="btn btn-restart" onclick="location.reload()">🔄 重新开始</button>
      </div>
    `;
  } else {
    overlay.classList.add('hidden');
  }
}

// ========== 交互逻辑 ==========

function onCityClick(cityId) {
  if (game.gameOver) return;

  const city = game.cities[cityId];

  // 法术模式下
  if (game.actionMode === 'spell' && game.pendingSpellId) {
    const isSelfSpell = ['jinguang', 'huichun', 'sadou', 'jinghua'].includes(game.pendingSpellId);
    const isAttackSpell = ['wulei', 'sanmei'].includes(game.pendingSpellId);

    if (isSelfSpell && city.owner !== 'player') return;
    if (isAttackSpell && city.owner === 'player') return;

    const success = castSpell('player', game.pendingSpellId, cityId);
    if (success) {
      cancelAction();
      renderAll();
    }
    return;
  }

  // 调兵模式
  if (game.actionMode === 'move' && game.sourceCity) {
    const src = game.cities[game.sourceCity];
    if (city.owner === 'player' && cityId !== game.sourceCity) {
      // 检查是否相邻
      const adj = getAdjacentCities(game.sourceCity);
      if (adj.includes(cityId)) {
        const moveTroops = Math.floor(src.troops * 0.5);
        if (moveTroops > 0) {
          src.troops -= moveTroops;
          city.troops += moveTroops;
          addLog('🚀 调兵', `${src.name} → ${city.name}，${moveTroops}兵力`);
          cancelAction();
          renderAll();
        }
      }
    }
    return;
  }

  // 进攻模式
  if (game.actionMode === 'attack' && game.sourceCity) {
    if (city.owner !== 'player' && city.owner !== game.cities[game.sourceCity].owner) {
      const adj = getAdjacentCities(game.sourceCity);
      if (adj.includes(cityId)) {
        const src = game.cities[game.sourceCity];
        const attackTroops = Math.floor(src.troops * 0.6);
        if (attackTroops > 0) {
          performAttack(game.sourceCity, cityId, attackTroops);
          cancelAction();
          renderAll();
        }
      }
    }
    return;
  }

  // 普通模式 — 选择城池
  game.selectedCity = cityId;
  game.sourceCity = null;
  game.actionMode = null;
  renderAll();
}

function startMoveTroops(cityId) {
  game.sourceCity = cityId;
  game.actionMode = 'move';
  game.selectedCity = cityId;
  renderAll();
}

function startAttack(cityId) {
  game.sourceCity = cityId;
  game.actionMode = 'attack';
  game.selectedCity = cityId;
  renderAll();
}

function showSpellTarget(cityIdOrSpellId, isSpell = false) {
  if (isSpell) {
    game.pendingSpellId = cityIdOrSpellId;
    game.actionMode = 'spell';
    game.selectedCity = null;
  } else {
    // 从城池详情点击施法 - 切换到法术选择
    // For now, just select the city
    game.selectedCity = cityIdOrSpellId;
  }
  renderAll();
}

function cancelAction() {
  game.actionMode = null;
  game.sourceCity = null;
  game.pendingSpellId = null;
  renderAll();
}

function onEndTurn() {
  if (game.gameOver) return;
  endTurn();
  renderAll();
}

// ---------- 辅助 ----------
function calculateRegionBounds() {
  const bounds = {};
  CITIES.forEach(c => {
    if (!bounds[c.region]) {
      bounds[c.region] = { x: Infinity, y: Infinity, w: 0, h: 0 };
    }
    const b = bounds[c.region];
    b.x = Math.min(b.x, c.x);
    b.y = Math.min(b.y, c.y);
    b.w = Math.max(b.w, c.x - b.x);
    b.h = Math.max(b.h, c.y - b.y);
  });
  // 加 padding
  Object.keys(bounds).forEach(k => {
    bounds[k].x -= 20;
    bounds[k].y -= 25;
    bounds[k].w += 40;
    bounds[k].h += 50;
  });
  return bounds;
}

function bindEvents() {
  // 窗口调整
  window.addEventListener('resize', () => renderMap());
}

// ---------- 困难度选择 ----------
function startGame(difficulty) {
  document.getElementById('menu-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  initGame(difficulty);
  initUI();
}
