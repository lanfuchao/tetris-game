# GitHub 上传指南

## 步骤 1: 在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 登录账号 `lanfuchao`
3. 填写仓库信息:
   - Repository name: `tetris-game`
   - Description: `🎮 经典俄罗斯方块游戏 - TypeScript + Webpack + 响应式设计`
   - 选择 **Public** (公开)
   - **不要** 勾选 "Initialize this repository with a README"
   - **不要** 添加 .gitignore 或 license (我们已经有了)
4. 点击 "Create repository"

## 步骤 2: 推送代码

创建仓库后，GitHub 会显示推送命令。在终端执行以下命令：

```bash
cd /Users/eric/work/games/tetris

# 添加远程仓库
git remote add origin https://github.com/lanfuchao/tetris-game.git

# 创建完整提交
git add -A
git commit -m "feat: 完整的俄罗斯方块游戏 v2.2.1

核心特性:
- 三种难度模式（简单/普通/困难）
- 指数衰减速度算法
- Web Audio API 音效系统
- 全面响应式设计（手机/平板/桌面）
- 模态弹窗系统
- TypeScript + Webpack 5

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# 推送到 GitHub
git branch -M main
git push -u origin main
```

## 步骤 3: 配置 GitHub Pages (可选)

如果想直接在线访问游戏:

1. 进入仓库设置: https://github.com/lanfuchao/tetris-game/settings
2. 点击左侧 "Pages"
3. Source 选择 "GitHub Actions"
4. 等待部署完成
5. 访问 https://lanfuchao.github.io/tetris-game

游戏会自动从 `dist/` 目录部署。

## 步骤 4: 添加仓库描述

在仓库主页添加以下标签 (Topics):
- tetris
- typescript
- webpack
- game
- canvas
- responsive-design
- web-audio-api

## 快速命令

如果遇到推送问题，可以强制推送:

```bash
git push -u origin main --force
```

## 克隆到其他机器

```bash
git clone https://github.com/lanfuchao/tetris-game.git
cd tetris-game
npm install
npm run dev
```

## 仓库建议配置

### README 徽章

在 README.md 顶部添加:

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Webpack](https://img.shields.io/badge/Webpack-5-blue.svg)](https://webpack.js.org/)
```

### 添加截图

在 README.md 中添加游戏截图目录:

```markdown
## 截图

![游戏主界面](screenshots/main.png)
![手机端](screenshots/mobile.png)
![难度选择](screenshots/difficulty.png)
```

### .github/FUNDING.yml (可选)

如果想接受赞助:

```yaml
github: lanfuchao
```

## 注意事项

1. **不要提交 node_modules/**: 已在 .gitignore 中
2. **不要提交 dist/**: 构建产物不需要提交
3. **保护 main 分支**: 在设置中启用分支保护
4. **添加 LICENSE**: MIT License 已包含

## 更新代码

日后更新代码:

```bash
git add -A
git commit -m "feat: 新功能描述"
git push
```

## 问题排查

### 推送被拒绝

```bash
git pull origin main --rebase
git push
```

### 需要身份验证

使用 Personal Access Token (PAT):
1. GitHub Settings → Developer settings → Personal access tokens
2. 生成新 token，勾选 `repo` 权限
3. 用 token 代替密码推送

### 忘记远程仓库地址

```bash
git remote -v
```
