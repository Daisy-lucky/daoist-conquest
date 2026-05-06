// ============================================================
// 《道境征途》- 游戏数据定义
// ============================================================

// 六大区域
const REGIONS = {
  tianque: { id: 'tianque', name: '天阙圣域', color: '#f1c40f', desc: '接近天界的至高之地' },
  kunlun:  { id: 'kunlun',  name: '昆仑神域', color: '#9b59b6', desc: '西昆仑山脉的神圣之地' },
  donghai: { id: 'donghai', name: '东海仙域', color: '#3498db', desc: '东海之上的仙家岛屿' },
  qingcheng: { id: 'qingcheng', name: '青城道域', color: '#2ecc71', desc: '道教发祥地，仙家汇聚' },
  dongtian: { id: 'dongtian', name: '洞天秘境', color: '#1abc9c', desc: '散布于各地的洞天福地' },
  youming: { id: 'youming',  name: '幽冥鬼域', color: '#e74c3c', desc: '阴气汇聚的险恶之地' }
};

// 城池数据: { id, name, region, x, y, desc, type, defense, initLevel, connections: [cityId] }
const CITIES = [
  // ===== 天阙圣域 =====
  { id: 'nantianmen', name: '南天门', region: 'tianque', x: 500, y: 45, desc: '天界之门，万丈金光', type: '要塞', defense: 2.0, initLevel: 2, initTroops: 15 },
  { id: 'lingxiaodian', name: '灵霄殿', region: 'tianque', x: 620, y: 70, desc: '玉皇大帝的宝殿', type: '圣地', defense: 1.5, initLevel: 3, initTroops: 20 },
  { id: 'yaotai', name: '瑶台', region: 'tianque', x: 420, y: 100, desc: '仙女起舞的仙台', type: '福地', defense: 1.0, initLevel: 2, initTroops: 12 },
  { id: 'doushuaigong', name: '兜率宫', region: 'tianque', x: 550, y: 120, desc: '太上老君的丹房', type: '福地', defense: 1.0, initLevel: 2, initTroops: 14 },
  { id: 'pantaoyuan', name: '蟠桃园', region: 'tianque', x: 470, y: 160, desc: '三千年一熟的仙桃', type: '秘境', defense: 0.8, initLevel: 1, initTroops: 10 },

  // ===== 昆仑神域 =====
  { id: 'yuxugong', name: '玉虚宫', region: 'kunlun', x: 120, y: 170, desc: '元始天尊的道场', type: '圣地', defense: 1.5, initLevel: 3, initTroops: 20 },
  { id: 'kunlunxu', name: '昆仑墟', region: 'kunlun', x: 200, y: 210, desc: '万山之祖，龙脉之源', type: '福地', defense: 1.2, initLevel: 2, initTroops: 15 },
  { id: 'xuanpu', name: '悬圃', region: 'kunlun', x: 280, y: 180, desc: '悬于空中的仙境花园', type: '秘境', defense: 0.8, initLevel: 1, initTroops: 10 },
  { id: 'xwangmu', name: '西王母殿', region: 'kunlun', x: 100, y: 260, desc: '西王母居住的宫殿', type: '福地', defense: 1.0, initLevel: 2, initTroops: 14 },
  { id: 'buzhoushan', name: '不周山', region: 'kunlun', x: 240, y: 300, desc: '共工怒触的天柱', type: '要塞', defense: 1.8, initLevel: 2, initTroops: 18 },

  // ===== 东海仙域 =====
  { id: 'penglai', name: '蓬莱', region: 'donghai', x: 780, y: 150, desc: '东海仙山之首', type: '圣地', defense: 1.5, initLevel: 3, initTroops: 20 },
  { id: 'fangzhang', name: '方丈', region: 'donghai', x: 850, y: 190, desc: '东海第二大仙山', type: '福地', defense: 1.0, initLevel: 2, initTroops: 14 },
  { id: 'yingzhou', name: '瀛洲', region: 'donghai', x: 920, y: 160, desc: '东海第三大仙山', type: '福地', defense: 1.0, initLevel: 2, initTroops: 12 },
  { id: 'daiyu', name: '岱舆', region: 'donghai', x: 740, y: 220, desc: '随波浮沉的仙岛', type: '秘境', defense: 0.8, initLevel: 1, initTroops: 10 },
  { id: 'fusang', name: '扶桑岛', region: 'donghai', x: 900, y: 250, desc: '日出之处的神木之岛', type: '要塞', defense: 1.6, initLevel: 2, initTroops: 16 },

  // ===== 青城道域 =====
  { id: 'qingchengshan', name: '青城山', region: 'qingcheng', x: 270, y: 390, desc: '道教发祥圣地', type: '圣地', defense: 1.5, initLevel: 3, initTroops: 20 },
  { id: 'emeishan', name: '峨眉山', region: 'qingcheng', x: 350, y: 420, desc: '普贤菩萨道场', type: '福地', defense: 1.2, initLevel: 2, initTroops: 14 },
  { id: 'hemingshan', name: '鹤鸣山', region: 'qingcheng', x: 430, y: 390, desc: '张天师创教之地', type: '福地', defense: 1.0, initLevel: 2, initTroops: 12 },
  { id: 'longhushan', name: '龙虎山', region: 'qingcheng', x: 200, y: 460, desc: '正一道祖庭，龙虎交汇', type: '要塞', defense: 1.8, initLevel: 2, initTroops: 16 },
  { id: 'wudangshan', name: '武当山', region: 'qingcheng', x: 340, y: 490, desc: '真武大帝道场', type: '福地', defense: 1.0, initLevel: 2, initTroops: 14 },

  // ===== 洞天秘境 =====
  { id: 'wangwushan', name: '王屋山', region: 'dongtian', x: 600, y: 380, desc: '天下第一洞天', type: '圣地', defense: 1.5, initLevel: 3, initTroops: 20 },
  { id: 'weiyushan', name: '委羽山', region: 'dongtian', x: 680, y: 410, desc: '第二大洞天', type: '福地', defense: 1.0, initLevel: 2, initTroops: 14 },
  { id: 'kuocangshan', name: '括苍山', region: 'dongtian', x: 760, y: 380, desc: '第十洞天福地', type: '福地', defense: 1.0, initLevel: 2, initTroops: 12 },
  { id: 'luofushan', name: '罗浮山', region: 'dongtian', x: 550, y: 450, desc: '岭南第一山', type: '要塞', defense: 1.6, initLevel: 2, initTroops: 16 },
  { id: 'jinquishan', name: '句曲山', region: 'dongtian', x: 660, y: 480, desc: '茅山祖庭所在', type: '福地', defense: 1.0, initLevel: 1, initTroops: 12 },

  // ===== 幽冥鬼域 =====
  { id: 'fengducheng', name: '酆都城', region: 'youming', x: 380, y: 560, desc: '鬼域都城，阴气最重', type: '要塞', defense: 1.8, initLevel: 2, initTroops: 18 },
  { id: 'guiyinguan', name: '鬼门关', region: 'youming', x: 500, y: 560, desc: '阴阳两界的分界', type: '福地', defense: 1.2, initLevel: 2, initTroops: 14 },
  { id: 'naiheqiao', name: '奈何桥', region: 'youming', x: 620, y: 560, desc: '亡魂渡桥，前尘尽忘', type: '秘境', defense: 0.8, initLevel: 1, initTroops: 10 },
  { id: 'wangxiangtai', name: '望乡台', region: 'youming', x: 400, y: 620, desc: '亡魂最后回望人间', type: '福地', defense: 1.0, initLevel: 1, initTroops: 12 },
  { id: 'yanluodian', name: '阎罗殿', region: 'youming', x: 520, y: 640, desc: '阎罗王审判之地', type: '圣地', defense: 1.5, initLevel: 3, initTroops: 22 },
];

// 城池连接（双向）
const CONNECTIONS = [
  // 天阙圣域内部
  ['nantianmen', 'lingxiaodian'], ['nantianmen', 'yaotai'],
  ['lingxiaodian', 'doushuaigong'], ['lingxiaodian', 'pantaoyuan'],
  ['yaotai', 'doushuaigong'], ['yaotai', 'pantaoyuan'],
  ['doushuaigong', 'pantaoyuan'],

  // 昆仑神域内部
  ['yuxugong', 'kunlunxu'], ['yuxugong', 'xwangmu'],
  ['kunlunxu', 'xuanpu'], ['kunlunxu', 'buzhoushan'],
  ['xuanpu', 'xwangmu'], ['xuanpu', 'buzhoushan'],
  ['xwangmu', 'buzhoushan'],

  // 东海仙域内部
  ['penglai', 'fangzhang'], ['penglai', 'daiyu'],
  ['fangzhang', 'yingzhou'], ['fangzhang', 'fusang'],
  ['yingzhou', 'fusang'], ['yingzhou', 'daiyu'],
  ['daiyu', 'fusang'],

  // 青城道域内部
  ['qingchengshan', 'emeishan'], ['qingchengshan', 'longhushan'],
  ['emeishan', 'hemingshan'], ['emeishan', 'wudangshan'],
  ['hemingshan', 'longhushan'], ['hemingshan', 'wudangshan'],
  ['longhushan', 'wudangshan'],

  // 洞天秘境内部
  ['wangwushan', 'weiyushan'], ['wangwushan', 'luofushan'],
  ['weiyushan', 'kuocangshan'], ['weiyushan', 'jinquishan'],
  ['kuocangshan', 'luofushan'], ['kuocangshan', 'jinquishan'],
  ['luofushan', 'jinquishan'],

  // 幽冥鬼域内部
  ['fengducheng', 'guiyinguan'], ['fengducheng', 'wangxiangtai'],
  ['guiyinguan', 'naiheqiao'], ['guiyinguan', 'yanluodian'],
  ['naiheqiao', 'yanluodian'], ['naiheqiao', 'wangxiangtai'],
  ['wangxiangtai', 'yanluodian'],

  // 跨域连接
  ['nantianmen', 'yuxugong'],       // 天阙 ↔ 昆仑
  ['nantianmen', 'penglai'],        // 天阙 ↔ 东海
  ['lingxiaodian', 'kunlunxu'],     // 天阙 ↔ 昆仑
  ['pantaoyuan', 'xuanpu'],         // 天阙 ↔ 昆仑
  ['pantaoyuan', 'fusang'],         // 天阙 ↔ 东海

  ['yuxugong', 'qingchengshan'],    // 昆仑 ↔ 青城
  ['buzhoushan', 'longhushan'],     // 昆仑 ↔ 青城

  ['penglai', 'kuocangshan'],       // 东海 ↔ 洞天
  ['daiyu', 'luofushan'],           // 东海 ↔ 洞天

  ['qingchengshan', 'wangwushan'],  // 青城 ↔ 洞天
  ['hemingshan', 'kuocangshan'],    // 青城 ↔ 洞天

  ['wudangshan', 'fengducheng'],    // 青城 ↔ 幽冥
  ['longhushan', 'fengducheng'],    // 青城 ↔ 幽冥

  ['wangwushan', 'guiyinguan'],     // 洞天 ↔ 幽冥
  ['jinquishan', 'naiheqiao'],      // 洞天 ↔ 幽冥
];

// 势力定义
const FACTIONS = {
  player: {
    id: 'player', name: '云游道人', shortName: '道友',
    color: '#3498db', lightColor: '#85c1e9',
    desc: '玩家 — 奉师命下山，荡涤浊气，重整三界',
    isPlayer: true
  },
  biyou: {
    id: 'biyou', name: '碧游宫', shortName: '截教',
    color: '#e74c3c', lightColor: '#f1948a',
    desc: '截教残余 — 好战激进，信奉有教无类',
    isPlayer: false, aiPersonality: 'aggressive'
  },
  western: {
    id: 'western', name: '西方教', shortName: '佛门',
    color: '#2ecc71', lightColor: '#82e0aa',
    desc: '西方教 — 稳扎稳打，图谋东进传道',
    isPlayer: false, aiPersonality: 'defensive'
  },
  demon: {
    id: 'demon', name: '妖神盟', shortName: '妖族',
    color: '#e67e22', lightColor: '#f0b27a',
    desc: '妖族联盟 — 诡变多端，游击骚扰',
    isPlayer: false, aiPersonality: 'guerrilla'
  },
  sanxian: {
    id: 'sanxian', name: '散仙盟', shortName: '散仙',
    color: '#9b59b6', lightColor: '#c39bd3',
    desc: '散仙联盟 — 中立厚积，后期爆发',
    isPlayer: false, aiPersonality: 'turtle'
  }
};

// 城池初始归属 - 每个势力4座城，其余中立
const INITIAL_OWNERSHIP = {
  player:  ['qingchengshan', 'emeishan', 'hemingshan', 'wudangshan'],
  biyou:   ['kunlunxu', 'xuanpu', 'buzhoushan', 'xwangmu'],
  western: ['penglai', 'fangzhang', 'yingzhou', 'fusang'],
  demon:   ['fengducheng', 'guiyinguan', 'naiheqiao', 'yanluodian'],
  sanxian: ['wangwushan', 'weiyushan', 'kuocangshan', 'jinquishan'],
};

// 中立城池
const NEUTRAL_CITIES = [
  'nantianmen', 'lingxiaodian', 'yaotai', 'doushuaigong', 'pantaoyuan',
  'yuxugong', 'daiyu', 'longhushan', 'luofushan', 'wangxiangtai'
];
