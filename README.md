# ☯ 道境征途 — Daoist Conquest

> 道教神话风格回合制策略占城游戏

## 📖 项目简介

《道境征途》是一款以 **中国道教神话** 为背景的单人回合制策略占城游戏。游戏继承了《占城大师》（Risk）的经典占城玩法框架，融入了丰富的道教文化元素，包括神仙体系、法术法宝、洞天福地等。

玩家将扮演一位云游道人，在浊气横行的神话世界中征服各大仙山福地，收集道之本源，净化天地灵脉，最终定鼎三界。

## 🌐 在线试玩

### Web 网页版
**👉 https://daisy-lucky.github.io/daoist-conquest/**

直接打开浏览器即可游玩，支持 PC 和移动端。

### 微信小游戏版
项目中的 `minigame/` 目录为微信小游戏版本，使用 Canvas 2D 渲染，适合在微信中运行。需通过微信开发者工具导入并配置 AppID 后使用。

## 🎮 核心特色

- **🏯 经典占城玩法** — 在节点式地图上运筹帷幄，调兵遣将，攻城略地
- **🐉 道教神话世界观** — 取材自道教经典、三十六洞天、七十二福地
- **🧙 法术法宝系统** — 五雷正法、撒豆成兵、轩辕剑、太极图等独特设定
- **🤖 智能AI对手** — 4个性格各异的势力，各有独特的战术策略
- **📜 剧情事件系统** — 随机事件与主线剧情交织，每次游戏体验不同

## 📂 项目结构

```
daoist-conquest/
├── README.md                      # 项目说明
├── 设计文档/                       # 游戏设计文档（10章完整设计）
│   ├── 01-游戏概述.md
│   ├── 02-世界观与背景故事.md
│   ├── 03-核心玩法.md
│   ├── 04-地图系统.md
│   ├── 05-兵种系统.md
│   ├── 06-法术与法宝系统.md
│   ├── 07-资源与经济系统.md
│   ├── 08-AI对手系统.md
│   ├── 09-游戏流程与事件系统.md
│   └── 10-界面与交互设计.md
├── web/                           # Web 网页版（已部署 GitHub Pages）
│   ├── index.html                 # 主页面
│   ├── css/style.css              # 样式
│   └── js/
│       ├── game-data.js           # 城池、连接、势力数据
│       ├── game-state.js          # 核心逻辑、战斗、回合
│       ├── spells.js              # 法术系统
│       ├── ai.js                  # AI 策略
│       └── ui.js                  # 界面渲染与交互（DOM版）
└── minigame/                      # 微信小游戏版
    ├── game.js                    # 入口文件
    ├── game.json                  # 小游戏配置
    ├── project.config.json        # 项目配置
    └── js/
        ├── game-data.js           # 城池数据（通用）
        ├── game-state.js          # 核心逻辑（通用）
        ├── spells.js              # 法术系统（通用）
        ├── ai.js                  # AI 系统（通用）
        └── render.js              # Canvas 渲染引擎
```

## 🎯 如何游玩

### Web 版
1. 打开 https://daisy-lucky.github.io/daoist-conquest/
2. 选择难度（简单/普通/困难/宗师）
3. 点击己方城池（青色）→ 选择「调兵」或「进攻」
4. 使用法术改变战局
5. 点击「结束回合」让 AI 行动
6. 征服所有城池，统一三界！

### 微信小游戏版
1. 使用微信开发者工具打开 `minigame/` 目录
2. 配置有效的小游戏 AppID
3. 编译运行即可

## 🛠️ 技术栈

| 平台 | 技术 |
|------|------|
| Web 版 | HTML5 + CSS3 + JavaScript (DOM/SVG) |
| 微信小游戏 | Canvas 2D + WeChat Mini Game API |
| 通用逻辑 | 纯 JavaScript（跨平台复用） |

## 📦 仓库地址

- **Gitee**: https://gitee.com/quan-yuzhen/daoist-conquest
- **GitHub**: https://github.com/Daisy-lucky/daoist-conquest
- **GitHub Pages**: https://daisy-lucky.github.io/daoist-conquest/

---

**📅 创建时间：** 2026年5月
**🎨 游戏设计 & 开发：** 基于《占城大师》玩法重新设计
