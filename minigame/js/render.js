// ============================================================
// 《道境征途》- 微信小游戏 Canvas 渲染引擎
// ============================================================

// ---------- 系统变量 ----------
let canvas, ctx, sysInfo;
let uiState = 'menu';        // menu, playing, modal, gameover
let selectedCity = null;
let sourceCity = null;
let actionMode = null;       // null, 'move', 'attack', 'spell'
let pendingSpellId = null;
let modalInfo = null;
let touchStartPos = null;
let cameraOffset = { x: 0, y: 0 };
let animFrame = 0;
let gameStarted = false;
let btnRects = {};

const CITY_RADIUS = 22;
const COLORS = {
  bg: '#0a0a1a',
  gold: '#d4a34a',
  goldLight: '#f0d080',
  text: '#f0e6d3',
  textDim: '#a09880',
  blue: '#3498db',
  red: '#e74c3c',
  green: '#2ecc71',
  orange: '#e67e22',
  purple: '#9b59b6',
  cyan: '#4ecdc4',
  panel: 'rgba(15,15,40,0.92)',
  border: 'rgba(212,163,74,0.3)',
};

// ---------- 初始化 ----------
function initRender() {
  sysInfo = wx.getSystemInfoSync();
  const winW = sysInfo.windowWidth;
  const winH = sysInfo.windowHeight;

  // 创建主画布
  canvas = wx.createCanvas();
  canvas.width = winW;
  canvas.height = winH;
  ctx = canvas.getContext('2d');

  // 触摸事件
  wx.onTouchStart(onTouchStart);
  wx.onTouchMove(onTouchMove);
  wx.onTouchEnd(onTouchEnd);

  // 开始渲染循环
  gameLoop();
}

// ---------- 游戏循环 ----------
function gameLoop() {
  animFrame++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (uiState === 'menu') {
    drawMenu();
  } else if (uiState === 'playing') {
    drawGame();
  } else if (uiState === 'modal') {
    drawGame();
    drawModal();
  } else if (uiState === 'gameover') {
    drawGame();
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

// ========== 主菜单 ==========
function drawMenu() {
  const w = canvas.width, h = canvas.height;

  // 背景
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);

  // 装饰光晕
  const grad1 = ctx.createRadialGradient(w*0.3, h*0.3, 0, w*0.3, h*0.3, w*0.5);
  grad1.addColorStop(0, 'rgba(78,205,196,0.06)');
  grad1.addColorStop(1, 'transparent');
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, w, h);

  const grad2 = ctx.createRadialGradient(w*0.7, h*0.7, 0, w*0.7, h*0.7, w*0.5);
  grad2.addColorStop(0, 'rgba(212,163,74,0.06)');
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, w, h);

  // 标题
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // ☯ 符号
  ctx.font = `${Math.floor(w * 0.12)}px sans-serif`;
  ctx.fillStyle = COLORS.gold;
  ctx.globalAlpha = 0.3;
  ctx.fillText('☯', w/2, h * 0.18);
  ctx.globalAlpha = 1;

  // 道境征途
  ctx.font = `bold ${Math.floor(w * 0.09)}px sans-serif`;
  ctx.fillStyle = COLORS.gold;
  ctx.shadowColor = 'rgba(212,163,74,0.3)';
  ctx.shadowBlur = 20;
  ctx.fillText('道境征途', w/2, h * 0.28);
  ctx.shadowBlur = 0;

  // 副标题
  ctx.font = `${Math.floor(w * 0.035)}px sans-serif`;
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText('Daoist Conquest', w/2, h * 0.35);

  // 难度按钮
  const difficulties = [
    { id: 'easy', label: '🌱 简单', desc: '轻松体验' },
    { id: 'normal', label: '☯ 普通', desc: '标准难度' },
    { id: 'hard', label: '🔥 困难', desc: '挑战升级' },
    { id: 'master', label: '👑 宗师', desc: '极限挑战' },
  ];

  const btnW = w * 0.55;
  const btnH = 48;
  const startY = h * 0.45;
  const gap = 10;

  btnRects.diffBtns = [];

  difficulties.forEach((d, i) => {
    const y = startY + i * (btnH + gap);
    const x = (w - btnW) / 2;
    btnRects.diffBtns.push({ id: d.id, x, y, w: btnW, h: btnH });

    // 按钮背景
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    roundRect(ctx, x, y, btnW, btnH, 8);
    ctx.fill();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, btnW, btnH, 8);
    ctx.stroke();

    // 按钮文字
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.floor(w * 0.038)}px sans-serif`;
    ctx.fillStyle = COLORS.gold;
    ctx.fillText(d.label, x + 16, y + btnH/2);

    ctx.textAlign = 'right';
    ctx.font = `${Math.floor(w * 0.028)}px sans-serif`;
    ctx.fillStyle = COLORS.textDim;
    ctx.fillText(d.desc, x + btnW - 16, y + btnH/2);
  });

  // 底部说明
  ctx.textAlign = 'center';
  ctx.font = `${Math.floor(w * 0.025)}px sans-serif`;
  ctx.fillStyle = 'rgba(160,152,128,0.4)';
  ctx.fillText('道教神话风格回合制策略占城游戏', w/2, h * 0.92);
}

// ========== 游戏主界面 ==========
function drawGame() {
  const w = canvas.width, h = canvas.height;
  if (!game) return;

  // 背景
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  // 绘制地图区域
  drawMap(w, h);

  // 绘制顶部栏
  drawTopBar(w, h);

  // 绘制底部操作栏
  drawBottomBar(w, h);

  // 操作提示
  if (actionMode) {
    drawActionHint(w, h);
  }

  // 绘制势力列表（右上角缩小版）
  drawFactionList(w, h);
}

// ---------- 绘制地图 ----------
function drawMap(w, h) {
  const mapTop = 50;
  const mapBottom = h - 60;
  const mapLeft = 10;
  const mapRight = w - 10;
  const mapW = mapRight - mapLeft;
  const mapH = mapBottom - mapTop;

  // 缩放和平移以适应屏幕
  const scaleX = mapW / 1060;
  const scaleY = mapH / 720;
  const scale = Math.min(scaleX, scaleY) * 0.85;

  const offsetX = mapLeft + (mapW - 1060 * scale) / 2;
  const offsetY = mapTop + (mapH - 720 * scale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // 绘制区域背景
  const regionBounds = calculateRegionBounds();
  Object.entries(REGIONS).forEach(([rid, reg]) => {
    const b = regionBounds[rid];
    if (!b) return;
    ctx.fillStyle = reg.color + '15';
    roundRect(ctx, b.x - 10, b.y - 15, b.w + 20, b.h + 30, 8);
    ctx.fill();
    ctx.strokeStyle = reg.color + '30';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    roundRect(ctx, b.x - 10, b.y - 15, b.w + 20, b.h + 30, 8);
    ctx.stroke();
    ctx.setLineDash([]);

    // 区域名称
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = reg.color + '99';
    ctx.fillText(reg.name, b.x + b.w/2, b.y - 18);
  });

  // 绘制连接线
  CONNECTIONS.forEach(([a, b]) => {
    const ca = game.cities[a];
    const cb = game.cities[b];
    if (!ca || !cb) return;

    const sameOwner = ca.owner === cb.owner && ca.owner && ca.owner !== 'neutral';
    ctx.strokeStyle = sameOwner
      ? (getFaction(ca.owner)?.color || '#666') + '66'
      : '#444';
    ctx.lineWidth = sameOwner ? 2.5 : 1.5;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(ca.x, ca.y);
    ctx.lineTo(cb.x, cb.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // 高亮选中城池的连线
  if (selectedCity) {
    const sc = game.cities[selectedCity];
    if (sc) {
      getAdjacentCities(selectedCity).forEach(nid => {
        const n = game.cities[nid];
        if (!n) return;
        const isEnemy = n.owner !== sc.owner;
        ctx.strokeStyle = isEnemy ? '#ff6b6b' : COLORS.cyan;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        ctx.setLineDash(isEnemy ? [] : [6, 4]);
        ctx.beginPath();
        ctx.moveTo(sc.x, sc.y);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      });
    }
  }

  // 绘制城池
  CITIES.forEach(c => {
    const city = game.cities[c.id];
    if (!city) return;

    const faction = city.owner && getFaction(city.owner);
    const fillColor = faction ? faction.color : '#888';
    const isSel = selectedCity === c.id;
    const isPlayer = city.owner === 'player';

    // 外圈光晕（选中）
    if (isSel) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, CITY_RADIUS + 6, 0, Math.PI * 2);
      ctx.fillStyle = fillColor + '40';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 城池主体
    ctx.beginPath();
    ctx.arc(c.x, c.y, CITY_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = fillColor + '30';
    ctx.fill();
    ctx.strokeStyle = isSel ? '#fff' : fillColor;
    ctx.lineWidth = isSel ? 3 : 2;
    ctx.stroke();

    // 城池图标（用文字代替）
    const typeIcon = { '圣地': '🏛', '要塞': '🏯', '福地': '🏔', '秘境': '🌿' }[city.type] || '🏘';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(typeIcon, c.x, c.y + 1);

    // 兵力数字
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = faction ? faction.lightColor : '#aaa';
    ctx.fillText(city.troops, c.x, c.y - CITY_RADIUS - 4);

    // 城池名称
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#ddd';
    ctx.fillText(city.name, c.x, c.y + CITY_RADIUS + 12);

    // 灵脉等级
    if (city.level > 0) {
      const dots = '●'.repeat(Math.min(city.level, 5));
      ctx.font = '7px sans-serif';
      ctx.fillStyle = fillColor + '99';
      ctx.fillText(dots, c.x, c.y + CITY_RADIUS + 24);
    }

    // 玩家城池标记
    if (isPlayer) {
      ctx.beginPath();
      ctx.arc(c.x + CITY_RADIUS - 4, c.y - CITY_RADIUS + 4, 4, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.blue;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  ctx.restore();

  // 存储点击区域用于触摸检测
  btnRects.cities = {};
  CITIES.forEach(c => {
    const cx = c.x * scale + offsetX;
    const cy = c.y * scale + offsetY;
    const r = CITY_RADIUS * scale;
    btnRects.cities[c.id] = { x: cx - r, y: cy - r, w: r * 2, h: r * 2, cx, cy, r };
  });
}

// ---------- 顶部栏 ----------
function drawTopBar(w, h) {
  if (!game) return;

  const f = game.factions.player;
  const barH = 44;

  // 背景
  ctx.fillStyle = 'rgba(10,10,26,0.92)';
  ctx.fillRect(0, 0, w, barH);
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barH);
  ctx.lineTo(w, barH);
  ctx.stroke();

  // 标题
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = COLORS.gold;
  ctx.fillText(`☯ 第${game.turn}回`, 12, barH / 2);

  // 资源
  const resX = w - 12;
  const resItems = [
    { icon: '🧿', val: f.lingmai },
    { icon: '⭐', val: f.gongde },
    { icon: '🏙', val: getFactionCities('player').length },
    { icon: '⚔', val: getFactionTroopCount('player') },
  ];

  let rx = resX;
  ctx.textAlign = 'right';
  ctx.font = '12px sans-serif';
  for (let i = resItems.length - 1; i >= 0; i--) {
    const item = resItems[i];
    const text = `${item.icon} ${item.val}`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText(text, rx, barH / 2);
    rx -= ctx.measureText(text).width + 14;
  }
}

// ---------- 底部操作栏 ----------
function drawBottomBar(w, h) {
  if (!game || game.gameOver) return;

  const barH = 56;
  const barY = h - barH;

  // 背景
  ctx.fillStyle = 'rgba(10,10,26,0.92)';
  ctx.fillRect(0, barY, w, barH);
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barY);
  ctx.lineTo(w, barY);
  ctx.stroke();

  if (actionMode) return; // 操作模式时显示提示

  // 按钮
  const btnW = (w - 40) / 4;
  const btnH = 38;
  const btnY = barY + (barH - btnH) / 2;
  const buttons = [
    { id: 'move', label: '🚀 调兵', color: COLORS.cyan },
    { id: 'attack', label: '⚔ 进攻', color: COLORS.red },
    { id: 'spell', label: '🔮 法术', color: COLORS.purple },
    { id: 'endturn', label: '⏳ 结束', color: COLORS.gold },
  ];

  btnRects.bottomBtns = [];
  buttons.forEach((btn, i) => {
    const x = 12 + i * (btnW + 8);
    btnRects.bottomBtns.push({ id: btn.id, x, y: btnY, w: btnW, h: btnH });

    ctx.fillStyle = btn.color + '20';
    roundRect(ctx, x, btnY, btnW, btnH, 6);
    ctx.fill();
    ctx.strokeStyle = btn.color + '50';
    ctx.lineWidth = 1;
    roundRect(ctx, x, btnY, btnW, btnH, 6);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.floor(w * 0.032)}px sans-serif`;
    ctx.fillStyle = btn.color;
    ctx.fillText(btn.label, x + btnW / 2, btnY + btnH / 2);
  });
}

// ---------- 操作提示 ----------
function drawActionHint(w, h) {
  const hintY = h - 56;
  ctx.fillStyle = 'rgba(10,10,26,0.95)';
  ctx.fillRect(0, hintY, w, 56);

  const hints = {
    move: '🚀 点击相邻己方城池调兵',
    attack: '⚔ 点击相邻敌方城池进攻',
    spell: '🔮 点击目标城池施放法术',
  };
  const hint = hints[actionMode] || '';

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '14px sans-serif';
  ctx.fillStyle = COLORS.cyan;
  ctx.fillText(hint, 16, hintY + 28);

  // 取消按钮
  const cancelBtn = { id: 'cancel', x: w - 80, y: hintY + 10, w: 68, h: 36 };
  btnRects.cancelBtn = cancelBtn;
  ctx.fillStyle = 'rgba(231,76,60,0.2)';
  roundRect(ctx, cancelBtn.x, cancelBtn.y, cancelBtn.w, cancelBtn.h, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(231,76,60,0.4)';
  ctx.lineWidth = 1;
  roundRect(ctx, cancelBtn.x, cancelBtn.y, cancelBtn.w, cancelBtn.h, 6);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '13px sans-serif';
  ctx.fillStyle = COLORS.red;
  ctx.fillText('✕ 取消', cancelBtn.x + cancelBtn.w/2, cancelBtn.y + cancelBtn.h/2);
}

// ---------- 势力列表（右上角）----------
function drawFactionList(w, h) {
  if (!game || game.gameOver) return;

  const startX = w - 110;
  const startY = 48;
  const itemH = 20;

  ctx.globalAlpha = 0.85;
  let idx = 0;
  Object.entries(FACTIONS).forEach(([fid, f]) => {
    const fg = game.factions[fid];
    if (!fg) return;
    const y = startY + idx * itemH;
    const alive = fg.alive !== false;

    // 势力圆点
    ctx.beginPath();
    ctx.arc(startX + 6, y + itemH/2, 4, 0, Math.PI * 2);
    ctx.fillStyle = alive ? f.color : '#555';
    ctx.fill();

    // 名称和统计
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '10px sans-serif';
    ctx.fillStyle = alive ? COLORS.text : '#555';
    const cityCount = getFactionCities(fid).length;
    ctx.fillText(`${f.shortName}:${cityCount}`, startX + 14, y + itemH/2);
    idx++;
  });
  ctx.globalAlpha = 1;
}

// ========== 弹窗/模态框 ==========
function drawModal() {
  const w = canvas.width, h = canvas.height;
  if (!modalInfo) return;

  // 半透明遮罩
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, w, h);

  // 弹窗背景
  const mw = w * 0.82;
  const mh = h * 0.45;
  const mx = (w - mw) / 2;
  const my = (h - mh) / 2;

  ctx.fillStyle = 'rgba(15,15,40,0.96)';
  roundRect(ctx, mx, my, mw, mh, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  roundRect(ctx, mx, my, mw, mh, 12);
  ctx.stroke();

  const city = modalInfo;
  const faction = getFaction(city.owner);
  const ownerName = faction ? faction.name : (city.owner === 'neutral' ? '中立' : '');

  // 标题
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = faction ? faction.color : '#888';
  ctx.fillText(city.name, mx + mw/2, my + 16);

  // 类型和归属
  ctx.font = '13px sans-serif';
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText(`${city.type} · ${REGIONS[city.region]?.name || ''} · ${ownerName}`, mx + mw/2, my + 48);

  // 属性
  const statsY = my + 80;
  const stats = [
    `⚔ 兵力: ${city.troops}`,
    `🛡 防御: ${city.defense}`,
    `🧿 灵脉: Lv.${city.level}`,
    `📖 ${city.desc}`,
  ];

  ctx.textAlign = 'left';
  ctx.font = '14px sans-serif';
  ctx.fillStyle = COLORS.text;
  stats.forEach((s, i) => {
    ctx.fillText(s, mx + 20, statsY + i * 26);
  });

  // 按钮
  btnRects.modalBtns = [];
  const btnY = my + mh - 56;

  if (city.owner === 'player' && !game.gameOver) {
    const actions = [
      { id: `move_${city.id}`, label: '🚀 调兵', color: COLORS.cyan },
      { id: `attack_${city.id}`, label: '⚔ 进攻', color: COLORS.red },
      { id: `spell_${city.id}`, label: '🔮 法术', color: COLORS.purple },
    ];

    const btnW2 = (mw - 48) / 3;
    actions.forEach((a, i) => {
      const bx = mx + 12 + i * (btnW2 + 12);
      btnRects.modalBtns.push({ id: a.id, x: bx, y: btnY, w: btnW2, h: 38 });

      ctx.fillStyle = a.color + '20';
      roundRect(ctx, bx, btnY, btnW2, 38, 6);
      ctx.fill();
      ctx.strokeStyle = a.color + '50';
      ctx.lineWidth = 1;
      roundRect(ctx, bx, btnY, btnW2, 38, 6);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '13px sans-serif';
      ctx.fillStyle = a.color;
      ctx.fillText(a.label, bx + btnW2/2, btnY + 19);
    });
  } else {
    // 关闭按钮
    const closeBtn = { id: 'close_modal', x: mx + mw/2 - 50, y: btnY, w: 100, h: 38 };
    btnRects.modalBtns = [closeBtn];

    ctx.fillStyle = 'rgba(212,163,74,0.2)';
    roundRect(ctx, closeBtn.x, closeBtn.y, closeBtn.w, closeBtn.h, 6);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '14px sans-serif';
    ctx.fillStyle = COLORS.gold;
    ctx.fillText('关闭', closeBtn.x + 50, closeBtn.y + 19);
  }
}

// ========== 游戏结束 ==========
function drawGameOver() {
  if (!game || !game.gameOver) return;
  const w = canvas.width, h = canvas.height;

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, w, h);

  const mw = w * 0.75;
  const mh = h * 0.35;
  const mx = (w - mw) / 2;
  const my = (h - mh) / 2;

  const isVictory = game.victory;
  const bgColor = isVictory
    ? 'rgba(212,163,74,0.12)'
    : 'rgba(231,76,60,0.12)';
  const borderColor = isVictory ? COLORS.gold : COLORS.red;

  ctx.fillStyle = bgColor;
  roundRect(ctx, mx, my, mw, mh, 16);
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  roundRect(ctx, mx, my, mw, mh, 16);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = 'bold 32px sans-serif';
  ctx.fillStyle = isVictory ? COLORS.gold : COLORS.red;
  ctx.shadowColor = isVictory ? 'rgba(212,163,74,0.3)' : 'rgba(231,76,60,0.3)';
  ctx.shadowBlur = 15;
  ctx.fillText(isVictory ? '🏆 三界一统！' : '💀 道消魔长', mx + mw/2, my + 60);
  ctx.shadowBlur = 0;

  ctx.font = '14px sans-serif';
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText(isVictory
    ? '你成功净化了天地灵脉，三界重归太平！'
    : '浊气彻底侵蚀了三界...',
    mx + mw/2, my + 110);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = COLORS.gold;
  ctx.fillText(`用时 ${game.turn} 回合 | 占领 ${getFactionCities('player').length} 座城池`,
    mx + mw/2, my + 150);

  // 重新开始按钮
  const restartBtn = { id: 'restart', x: mx + mw/2 - 70, y: my + mh - 55, w: 140, h: 40 };
  btnRects.restartBtn = restartBtn;

  ctx.fillStyle = COLORS.gold;
  roundRect(ctx, restartBtn.x, restartBtn.y, restartBtn.w, restartBtn.h, 8);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#1a1a2e';
  ctx.fillText('🔄 重新开始', restartBtn.x + 70, restartBtn.y + 20);
}

// ========== 触摸事件处理 ==========
function onTouchStart(e) {
  touchStartPos = { x: e.touches[0].x, y: e.touches[0].y };
}

function onTouchMove(e) {
  // 可以用于地图拖动
}

function onTouchEnd(e) {
  if (!e.changedTouches || !e.changedTouches[0]) return;
  const pos = { x: e.changedTouches[0].x, y: e.changedTouches[0].y };

  // 检查是否是点击（而非拖动）
  if (touchStartPos) {
    const dx = pos.x - touchStartPos.x;
    const dy = pos.y - touchStartPos.y;
    if (Math.sqrt(dx*dx + dy*dy) > 15) return; // 是拖动，忽略
  }

  handleTap(pos.x, pos.y);
}

function handleTap(tx, ty) {
  if (uiState === 'menu') {
    // 检查难度按钮
    if (btnRects.diffBtns) {
      for (const btn of btnRects.diffBtns) {
        if (pointInRect(tx, ty, btn)) {
          startMiniGame(btn.id);
          return;
        }
      }
    }
    return;
  }

  if (uiState === 'gameover') {
    if (btnRects.restartBtn && pointInRect(tx, ty, btnRects.restartBtn)) {
      restartMiniGame();
      return;
    }
    return;
  }

  if (uiState === 'modal') {
    // 检查弹窗按钮
    if (btnRects.modalBtns) {
      for (const btn of btnRects.modalBtns) {
        if (pointInRect(tx, ty, btn)) {
          handleModalAction(btn.id);
          return;
        }
      }
    }
    // 点击弹窗外关闭
    if (modalInfo) {
      const mw = canvas.width * 0.82;
      const mh = canvas.height * 0.45;
      const mx = (canvas.width - mw) / 2;
      const my = (canvas.height - mh) / 2;
      if (!pointInRect(tx, ty, { x: mx, y: my, w: mw, h: mh })) {
        closeModal();
      }
    }
    return;
  }

  // 游戏进行中
  if (uiState === 'playing') {
    // 检查操作模式下的取消按钮
    if (actionMode && btnRects.cancelBtn && pointInRect(tx, ty, btnRects.cancelBtn)) {
      cancelAction2();
      return;
    }

    // 检查底部按钮
    if (!actionMode && btnRects.bottomBtns) {
      for (const btn of btnRects.bottomBtns) {
        if (pointInRect(tx, ty, btn)) {
          handleBottomAction(btn.id);
          return;
        }
      }
    }

    // 检查城池点击
    if (btnRects.cities) {
      let tappedCity = null;
      let minDist = Infinity;
      for (const [cid, area] of Object.entries(btnRects.cities)) {
        const dist = Math.sqrt((tx - area.cx) ** 2 + (ty - area.cy) ** 2);
        if (dist <= area.r && dist < minDist) {
          minDist = dist;
          tappedCity = cid;
        }
      }
      if (tappedCity) {
        handleCityTap(tappedCity);
        return;
      }
    }
  }
}

// ========== 操作处理 ==========
function handleCityTap(cityId) {
  if (game.gameOver) return;
  const city = game.cities[cityId];

  // 法术模式
  if (actionMode === 'spell' && pendingSpellId) {
    const isSelf = ['jinguang', 'huichun', 'sadou', 'jinghua'].includes(pendingSpellId);
    const isAttack = ['wulei', 'sanmei'].includes(pendingSpellId);
    if ((isSelf && city.owner !== 'player') || (isAttack && city.owner === 'player')) return;
    if (isAttack && city.owner === 'player') return;

    const success = castSpell('player', pendingSpellId, cityId);
    if (success) {
      cancelAction2();
    }
    return;
  }

  // 调兵模式
  if (actionMode === 'move' && sourceCity) {
    const src = game.cities[sourceCity];
    if (city.owner === 'player' && cityId !== sourceCity) {
      const adj = getAdjacentCities(sourceCity);
      if (adj.includes(cityId)) {
        const moveTroops = Math.floor(src.troops * 0.5);
        if (moveTroops > 0) {
          src.troops -= moveTroops;
          city.troops += moveTroops;
          addLog('🚀 调兵', `${src.name} → ${city.name}，${moveTroops}兵力`);
          cancelAction2();
        }
      }
    }
    return;
  }

  // 进攻模式
  if (actionMode === 'attack' && sourceCity) {
    const srcCity = game.cities[sourceCity];
    if (city.owner !== 'player' && city.owner !== srcCity.owner) {
      const adj = getAdjacentCities(sourceCity);
      if (adj.includes(cityId)) {
        const attackTroops = Math.floor(srcCity.troops * 0.6);
        if (attackTroops > 0) {
          performAttack(sourceCity, cityId, attackTroops);
          cancelAction2();
        }
      }
    }
    return;
  }

  // 普通模式 — 显示弹窗
  selectedCity = cityId;
  sourceCity = null;
  modalInfo = city;
  uiState = 'modal';
}

function handleModalAction(actionId) {
  if (actionId === 'close_modal') {
    closeModal();
    return;
  }

  if (actionId.startsWith('move_')) {
    const cityId = actionId.replace('move_', '');
    sourceCity = cityId;
    actionMode = 'move';
    selectedCity = cityId;
    closeModal();
    return;
  }

  if (actionId.startsWith('attack_')) {
    const cityId = actionId.replace('attack_', '');
    sourceCity = cityId;
    actionMode = 'attack';
    selectedCity = cityId;
    closeModal();
    return;
  }

  if (actionId.startsWith('spell_')) {
    closeModal();
    // 显示法术选择 - 简化：显示一个法术选择界面
    showSpellSelector();
    return;
  }
}

function handleBottomAction(actionId) {
  if (actionId === 'endturn') {
    if (game.gameOver) return;
    endTurn();
    selectedCity = null;
    sourceCity = null;
    actionMode = null;
    return;
  }

  // 需要先选择城池
  if (!selectedCity) {
    showToast('请先点击选择一座己方城池');
    return;
  }

  const city = game.cities[selectedCity];
  if (!city || city.owner !== 'player') {
    showToast('请选择己方城池');
    return;
  }

  switch (actionId) {
    case 'move':
      sourceCity = selectedCity;
      actionMode = 'move';
      break;
    case 'attack':
      sourceCity = selectedCity;
      actionMode = 'attack';
      break;
    case 'spell':
      showSpellSelector();
      break;
  }
}

// ---------- 法术选择界面 ----------
function showSpellSelector() {
  const w = canvas.width, h = canvas.height;
  const spells = getPlayerSpells();

  const mw = w * 0.8;
  const mh = Math.min(spells.length * 50 + 60, h * 0.6);
  const mx = (w - mw) / 2;
  const my = (h - mh) / 2;

  modalInfo = { type: 'spell_selector', spells, mx, my, mw, mh };
  uiState = 'modal';

  // 为法术选择器构建按钮
  btnRects.modalBtns = [];
  spells.forEach((spell, i) => {
    const canCast = canCastSpell('player', spell.id);
    const bx = mx + 12;
    const by = my + 50 + i * 48;
    btnRects.modalBtns.push({
      id: `cast_${spell.id}`,
      x: bx, y: by, w: mw - 24, h: 42,
      spell, canCast
    });
  });
  // 关闭按钮
  btnRects.modalBtns.push({
    id: 'close_modal', x: mx + mw/2 - 40, y: my + mh - 46, w: 80, h: 36
  });
}

// 重写 drawModal 处理法术选择器
const origDrawModal = drawModal;
drawModal = function() {
  if (!modalInfo) return;
  if (modalInfo.type === 'spell_selector') {
    drawSpellSelector();
    return;
  }
  origDrawModal();
};

function drawSpellSelector() {
  const w = canvas.width, h = canvas.height;
  const { spells, mx, my, mw, mh } = modalInfo;

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(15,15,40,0.96)';
  roundRect(ctx, mx, my, mw, mh, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  roundRect(ctx, mx, my, mw, mh, 12);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = COLORS.gold;
  ctx.fillText('🔮 选择法术', mx + mw/2, my + 14);

  spells.forEach((spell, i) => {
    const canCast = canCastSpell('player', spell.id);
    const cd = game.factions.player.spellCooldowns[spell.id] || 0;
    const by = my + 50 + i * 48;

    ctx.fillStyle = canCast ? 'rgba(78,205,196,0.08)' : 'rgba(255,255,255,0.02)';
    roundRect(ctx, mx + 12, by, mw - 24, 42, 6);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '14px sans-serif';
    ctx.fillStyle = canCast ? COLORS.text : '#666';
    ctx.fillText(`${spell.icon} ${spell.name}`, mx + 24, by + 21);

    ctx.textAlign = 'right';
    ctx.font = '12px sans-serif';
    ctx.fillStyle = canCast ? COLORS.gold : '#555';
    ctx.fillText(`🧿${spell.cost}`, mx + mw - 50, by + 21);

    if (cd > 0) {
      ctx.fillStyle = COLORS.red;
      ctx.fillText(`冷却${cd}回`, mx + mw - 24, by + 21);
    }
  });

  // 关闭按钮
  const closeBtn = btnRects.modalBtns.find(b => b.id === 'close_modal');
  if (closeBtn) {
    ctx.fillStyle = 'rgba(212,163,74,0.15)';
    roundRect(ctx, closeBtn.x, closeBtn.y, closeBtn.w, closeBtn.h, 6);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '14px sans-serif';
    ctx.fillStyle = COLORS.gold;
    ctx.fillText('关闭', closeBtn.x + closeBtn.w/2, closeBtn.y + closeBtn.h/2);
  }
}

// 处理法术选择器按钮点击
// Override handleModalAction partially
function closeModal() {
  modalInfo = null;
  btnRects.modalBtns = [];
  uiState = 'playing';
}

function cancelAction2() {
  actionMode = null;
  sourceCity = null;
  pendingSpellId = null;
  selectedCity = null;
}

function showToast(msg) {
  // 简单提示 - 显示在屏幕中央2秒
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  roundRect(ctx, w/2 - 120, h/2 - 25, 240, 50, 8);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText(msg, w/2, h/2);
  // 用 setTimeout 清除 - 下次渲染会覆盖
}

// ========== 游戏启动 ==========
function startMiniGame(difficulty) {
  initGame(difficulty);
  uiState = 'playing';
  gameStarted = true;
  selectedCity = null;
  sourceCity = null;
  actionMode = null;
}

function restartMiniGame() {
  uiState = 'menu';
  gameStarted = false;
  game = null;
}

// ========== 工具函数 ==========
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w &&
         py >= rect.y && py <= rect.y + rect.h;
}

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
  Object.keys(bounds).forEach(k => {
    bounds[k].x -= 20;
    bounds[k].y -= 25;
    bounds[k].w += 40;
    bounds[k].h += 50;
  });
  return bounds;
}

// ========== 启动 ==========
initRender();
