# 俄罗斯方块游戏

一个使用 TypeScript 开发的经典俄罗斯方块网页游戏。

## 特性

- 🎮 经典俄罗斯方块玩法
- 🎚️ 三种难度模式（简单、普通、困难）
- 📈 智能速度曲线算法（指数衰减）
- 🎵 动态音效系统
- 📊 得分和等级系统
- ⚡ TypeScript + Webpack 现代化构建
- 🎨 模块化代码结构

## 技术栈

- TypeScript
- Webpack 5
- HTML5 Canvas
- Web Audio API

## 项目结构

```
tetris/
├── src/
│   ├── styles/
│   │   └── main.css          # 样式文件
│   ├── utils/
│   │   ├── audio.ts          # 音效管理
│   │   └── renderer.ts       # 渲染引擎
│   ├── config.ts             # 游戏配置
│   ├── types.ts              # TypeScript 类型定义
│   ├── game.ts               # 游戏核心逻辑
│   ├── main.ts               # 入口文件
│   └── index.html            # HTML 模板
├── webpack.config.js         # Webpack 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 项目依赖
```

## 快速开始

### 方式一：使用脚本（推荐）

```bash
./start.sh
```

这将自动安装依赖并启动开发服务器。

### 方式二：手动命令

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

访问 http://localhost:8080

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（支持热重载） |
| `npm run build` | 构建生产版本 |
| `npm run clean` | 清理构建目录 |
| `./start.sh` | 一键启动开发服务器 |
| `./deploy.sh` | 构建并部署生产版本 |

## 部署

### 构建生产版本

```bash
npm run build
```

或使用部署脚本：

```bash
./deploy.sh
```

构建产物在 `dist/` 目录，可以部署到任何静态托管服务：

- Vercel
- Netlify
- GitHub Pages
- 阿里云 OSS
- 腾讯云 COS

## 游戏控制

- **←** 左移
- **→** 右移
- **↓** 按住快速下落
- **↑** 旋转方块
- **空格** 瞬间落地
- **P** 暂停/继续

## 难度模式

### 简单模式
- 初始速度: 1000ms，最低速度: 200ms
- 分数倍率: 1.0x
- 升级门槛: 每 1200 分升一级
- 适合新手玩家

### 普通模式
- 初始速度: 800ms，最低速度: 120ms
- 分数倍率: 1.5x
- 升级门槛: 每 1000 分升一级
- 适合有经验的玩家

### 困难模式
- 初始速度: 600ms，最低速度: 80ms
- 分数倍率: 2.0x
- 升级门槛: 每 800 分升一级
- 适合高手挑战

详细说明请查看 [DIFFICULTY_SYSTEM.md](./DIFFICULTY_SYSTEM.md)

## 游戏规则

- 消除一行得 100 分（基础分）
- 消除多行有额外加成（2行:300, 3行:500, 4行:800）
- 实际得分 = 基础分 × 等级 × 难度倍率
- 速度使用指数衰减曲线，更加平滑自然

## 开发

项目采用模块化设计：

- `game.ts` - 游戏主类，管理游戏状态和逻辑
- `difficulty.ts` - 难度系统和速度算法
- `renderer.ts` - 负责所有渲染操作
- `audio.ts` - 音效系统
- `config.ts` - 游戏配置参数
- `types.ts` - TypeScript 类型定义

## 许可证

MIT
