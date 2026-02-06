# 项目结构说明

## 目录结构

```
tetris/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Pages 自动部署配置
├── src/                      # 源代码目录
│   ├── styles/
│   │   └── main.css         # 全局样式
│   ├── utils/
│   │   ├── audio.ts         # 音效管理器
│   │   └── renderer.ts      # Canvas 渲染引擎
│   ├── config.ts            # 游戏配置（方块形状、颜色等）
│   ├── difficulty.ts        # 难度系统和速度算法
│   ├── types.ts             # TypeScript 类型定义
│   ├── game.ts              # 游戏核心类
│   ├── main.ts              # 应用入口
│   └── index.html           # HTML 模板
├── dist/                     # 构建输出目录（自动生成）
├── node_modules/            # 依赖包（自动生成）
├── .gitignore               # Git 忽略配置
├── package.json             # 项目配置和依赖
├── tsconfig.json            # TypeScript 配置
├── webpack.config.js        # Webpack 打包配置
├── start.sh                 # 快速启动脚本
├── deploy.sh                # 部署脚本
└── README.md                # 项目说明
```

## 核心模块说明

### 1. main.ts (入口文件)
- 导入样式
- 初始化游戏实例
- DOM 加载完成后启动

### 2. game.ts (游戏核心)
**职责：**
- 游戏状态管理
- 游戏逻辑控制
- 事件处理
- 协调渲染器和音效

**主要方法：**
- `start()` - 开始/重新开始游戏
- `pause()` - 暂停/继续游戏
- `moveLeft()`, `moveRight()` - 左右移动
- `rotate()` - 旋转方块
- `moveDown()` - 向下移动
- `hardDrop()` - 快速落地
- `startFastDrop()`, `stopFastDrop()` - 快速下落控制

### 3. renderer.ts (渲染引擎)
**职责：**
- Canvas 绘制
- 方块渲染
- 游戏面板渲染
- 下一个方块预览

**主要方法：**
- `drawBoard()` - 绘制游戏面板
- `drawPiece()` - 绘制方块
- `drawNextPiece()` - 绘制下一个方块
- `drawBlock()` - 绘制单个方块单元

### 4. audio.ts (音效管理)
**职责：**
- 使用 Web Audio API 生成音效
- 提供各种游戏音效

**音效类型：**
- `playMoveSound()` - 移动音效
- `playRotateSound()` - 旋转音效
- `playDropSound()` - 下落音效
- `playLandSound()` - 着陆音效
- `playClearSound()` - 消行音效
- `playGameOverSound()` - 游戏结束音效

### 5. config.ts (配置文件)
**配置项：**
- `cols`, `rows` - 游戏面板尺寸
- `blockSize` - 方块大小
- `colors` - 方块颜色数组
- `shapes` - 7种俄罗斯方块形状定义

### 6. difficulty.ts (难度系统)
**职责：**
- 定义三种难度配置
- 速度曲线算法（指数衰减）
- 等级和分数计算

**主要函数：**
- `getSpeed()` - 获取指定难度和等级的速度
- `calculateLevel()` - 根据分数计算等级
- `getDifficultyConfig()` - 获取难度配置
- `getNextLevelScore()` - 计算升级所需分数

**速度算法：**
```typescript
// 指数衰减公式
speed = initialSpeed × decayRate^(level - 1)

// 简单: 1000 × 0.92^(level-1), 最低 200ms
// 普通: 800 × 0.88^(level-1), 最低 120ms
// 困难: 600 × 0.85^(level-1), 最低 80ms
```

### 7. types.ts (类型定义)
**类型：**
- `Piece` - 方块接口
- `Difficulty` - 难度枚举
- `GameState` - 游戏状态接口（含难度）
- `Shape` - 方块形状类型
- `GameConfig` - 配置接口
- `DifficultyConfig` - 难度配置接口

## 技术架构

### 前端框架
- **TypeScript** - 类型安全的 JavaScript
- **Webpack 5** - 模块打包器
- **HTML5 Canvas** - 2D 图形渲染
- **Web Audio API** - 音效生成

### 构建工具
- **ts-loader** - TypeScript 加载器
- **css-loader** - CSS 模块加载
- **style-loader** - 样式注入
- **html-webpack-plugin** - HTML 生成

### 开发工具
- **webpack-dev-server** - 开发服务器
- **TypeScript Compiler** - 类型检查

## 设计模式

### 单例模式
- `TetrisGame` 类作为游戏的唯一实例

### 策略模式
- 不同的音效策略封装在 `AudioManager` 中

### 观察者模式
- 键盘事件监听和响应

### 分层架构
```
展示层 (HTML/CSS)
    ↓
控制层 (game.ts)
    ↓
业务层 (collision, clearLines, etc.)
    ↓
工具层 (renderer.ts, audio.ts)
    ↓
数据层 (config.ts, types.ts)
```

## 游戏状态机

```
[初始状态]
    ↓
[开始游戏] → [游戏进行中]
    ↓              ↓
    ↓         [暂停] ⇄ [继续]
    ↓              ↓
    ↓         [方块落地]
    ↓              ↓
    ↓         [检查消行]
    ↓              ↓
    ↓         [更新得分]
    ↓              ↓
    ↓         [生成新方块]
    ↓              ↓
    ↓         [检查游戏结束]
    ↓              ↓
[游戏结束] ←———————┘
    ↓
[重新开始]
```

## 性能优化

1. **Canvas 渲染优化**
   - 只在需要时重绘
   - 使用 `requestAnimationFrame` (考虑未来升级)

2. **音效优化**
   - 使用 Web Audio API 生成音效，避免加载音频文件
   - 音效短促，减少内存占用

3. **代码分割**
   - Webpack 自动进行代码分割
   - 支持按需加载

4. **生产构建**
   - 代码压缩
   - Tree shaking
   - 哈希文件名（利于缓存）

## 扩展建议

### 可添加的功能
1. **游戏功能**
   - 保存/加载游戏
   - 排行榜
   - 多人对战模式
   - 自定义主题

2. **技术改进**
   - 使用 React/Vue 重构 UI
   - 添加单元测试
   - 使用 PWA 技术支持离线
   - 添加移动端触摸控制

3. **视觉效果**
   - 粒子效果
   - 消行动画
   - 主题切换

## 调试技巧

### 开发模式
```bash
npm run dev
```
- 自动刷新
- Source Map 支持
- 详细错误信息

### 生产模式测试
```bash
npm run build
npx serve dist
```

### Chrome DevTools
- 使用 Sources 面板调试 TypeScript
- 使用 Performance 面板分析性能
- 使用 Network 面板检查资源加载
